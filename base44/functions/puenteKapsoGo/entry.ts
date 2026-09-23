import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';
import { waitUntil } from 'base44:runtime';
import {
  GO_PHONE_NUMBER_ID,
  EVENTO_MENSAJE_RECIBIDO,
  verificarFirma,
  normalizarMensaje,
  enviarRespuestaKapso,
  estadoPuente,
} from '../../shared/kapsoPuente.ts';

import { invocarGoWhatsApp, AGENTE_GO } from '../../shared/kapsoGoNarrativa.ts';
import { probarRecorridoInteractivo } from '../../shared/kapsoPruebaInteractiva.ts';
import { codisenarOnboardingGo } from '../../shared/kapsoCodisenoGo.ts';
import { probarOnboardingGo } from '../../shared/kapsoPruebaOnboarding.ts';

const MAX_REINTENTOS = 2;

export default async function (req: Request): Promise<Response> {
  // ---- Health check (GET) ----
  if (req.method === 'GET') {
    return Response.json({
      ok: true,
      servicio: 'puente-kapso-go',
      agente: AGENTE_GO,
      ...estadoPuente(secrets.get('KAPSO_WEBHOOK_SECRET'), secrets.get('KAPSO_API_KEY')),
    });
  }

  try {
    // ---- 1. Leer raw body y headers ----
    const rawBody = await req.arrayBuffer();
    const firma = req.headers.get('x-webhook-signature');
    const idempotencyKey = req.headers.get('x-idempotency-key') || '';
    const evento = req.headers.get('x-webhook-event') || '';
    const secreto = secrets.get('KAPSO_WEBHOOK_SECRET');

    if (!secreto) {
      return Response.json({ error: 'Webhook no configurado.' }, { status: 503 });
    }

    // Diagnóstico explícito de administrador: mismo adaptador y agente, sin envío por Kapso.
    // No acepta eventos entrantes ni sustituye la firma de la ruta webhook.
    if (!firma && req.headers.get('Authorization')) {
      const diagnostico = JSON.parse(new TextDecoder().decode(rawBody));
      if (['prueba_agente_go', 'prueba_interactiva_go', 'codiseno_onboarding_go', 'prueba_onboarding_go'].includes(diagnostico.modo)) {
        const cliente = createClientFromRequest(req);
        const usuario = await cliente.auth.me();
        if (usuario?.role !== 'admin') return Response.json({ error: 'Solo administrador.' }, { status: 403 });
        if (['prueba_interactiva_go', 'codiseno_onboarding_go', 'prueba_onboarding_go'].includes(diagnostico.modo)) {
          const headers = new Headers(req.headers);
          headers.set('X-Data-Env', 'dev');
          const clientePrueba = createClientFromRequest(new Request(req.url, { headers }));
          if (diagnostico.modo === 'prueba_onboarding_go') return Response.json(await probarOnboardingGo(clientePrueba, diagnostico));
          return Response.json(diagnostico.modo === 'codiseno_onboarding_go'
            ? await codisenarOnboardingGo(clientePrueba, diagnostico)
            : await probarRecorridoInteractivo(clientePrueba));
        }
        const pruebaId = crypto.randomUUID();
        const resultado = await invocarGoWhatsApp(cliente, {
          message_id: `prueba-go-${pruebaId}`, phone_number_id: GO_PHONE_NUMBER_ID,
          remite_numero: `prueba-${usuario.id}`, tipo_mensaje: 'texto',
          contenido_texto: 'Hola GO. Quiero iniciar un recorrido profesional del piso y estado actual de una obra; todavía no he compartido fotos ni identificado la obra. ¿Qué opciones tengo para comenzar?',
        }, { pruebaId });
        return Response.json({ ok: true, modo: 'prueba_agente_go', envio_whatsapp: false, ...resultado });
      }
    }

    // ---- 2. Verificar firma HMAC-SHA256 ----
    const firmaValida = await verificarFirma(rawBody, firma, secreto);
    if (!firmaValida) {
      return Response.json({ error: 'Firma inválida.' }, { status: 401 });
    }

    // ---- 3. Parsear y filtrar por evento y phone_number_id ----
    const payload = JSON.parse(new TextDecoder().decode(rawBody));
    const isBatch = req.headers.get('x-webhook-batch') === 'true' || payload.batch === true;
    const payloads = isBatch ? (payload.data || []) : [payload];

    if (evento && evento !== EVENTO_MENSAJE_RECIBIDO) {
      return Response.json({ ok: true, ignorado: evento });
    }

    const base44 = createClientFromRequest(req);
    const resultados: any[] = [];

    for (const item of payloads) {
      const phoneId = String(item.phone_number_id || item.metadata?.phone_number_id || '');
      if (phoneId !== GO_PHONE_NUMBER_ID) {
        resultados.push({ phone_id: phoneId, ignorado: 'phone_number_id no corresponde a GO' });
        continue;
      }

      const mensaje = normalizarMensaje(item, phoneId);
      if (!mensaje) {
        resultados.push({ error: 'No se pudo normalizar el mensaje.' });
        continue;
      }

      // ---- 4. Idempotencia estricta por message_id ----
      const existente = await base44.asServiceRole.entities.WebhookKapso.filter(
        { message_id: mensaje.message_id },
        '-created_date',
        1
      );
      if (existente.length > 0) {
        resultados.push({ message_id: mensaje.message_id, estado: 'duplicado' });
        continue;
      }

      // ---- 5. Crear registro de inbound ----
      const registro = await base44.asServiceRole.entities.WebhookKapso.create({
        message_id: mensaje.message_id,
        phone_number_id: mensaje.phone_number_id,
        conversation_id: mensaje.conversation_id,
        remite_numero: mensaje.remite_numero,
        remite_nombre: mensaje.remite_nombre,
        tipo_mensaje: mensaje.tipo_mensaje,
        contenido_texto: mensaje.contenido_texto.slice(0, 5000),
        archivo_url: mensaje.archivo_url,
        archivo_mime: mensaje.archivo_mime,
        transcripcion: mensaje.transcripcion,
        coordenadas_gps: mensaje.coordenadas_gps,
        timestamp_inbound: mensaje.timestamp_inbound,
        estado: 'procesando',
        es_test: true,
      });

      // ---- 6. Procesar con el agente GO existente y responder por Kapso ----
      waitUntil((async () => {
        let reintentos = 0;
        let exito = false;
        let errorFinal = '';

        while (reintentos <= MAX_REINTENTOS && !exito) {
          try {
            const { respuesta, opciones } = await invocarGoWhatsApp(base44, {
              ...registro, opcion_elegida: mensaje.opcion_elegida,
            });
            const envio = await enviarRespuestaKapso(phoneId, mensaje, respuesta, true, opciones);
            if (!envio.ok) throw new Error(envio.error || 'No se pudo preparar la respuesta de prueba.');
            await base44.asServiceRole.entities.WebhookKapso.update(registro.id, {
              estado: envio.ok ? 'respondido' : 'error',
              respuesta_texto: opciones.length ? JSON.stringify({ cuerpo: respuesta, opciones }) : respuesta,
              respuesta_message_id: envio.message_id || '',
              error_detalle: envio.error || '',
              reintentos,
            });
            if (envio.ok) exito = true;
            else errorFinal = envio.error || '';
          } catch (e) {
            errorFinal = e.message;
            reintentos++;
            await base44.asServiceRole.entities.WebhookKapso.update(registro.id, {
              estado: reintentos > MAX_REINTENTOS ? 'error' : 'procesando',
              reintentos,
              error_detalle: errorFinal,
            });
          }
        }
      })());

      resultados.push({ message_id: mensaje.message_id, estado: 'procesando' });
    }

    console.info('puenteKapsoGo: recepción aceptada', { cantidad: resultados.length, modo_test: true });
    return Response.json({ ok: true, procesados: resultados });
  } catch (error) {
    console.error('puenteKapsoGo: recepción fallida', { nombre: error.name, mensaje: error.message });
    return Response.json({ error: error.message || 'Error interno.' }, { status: 500 });
  }
}