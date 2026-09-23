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
import { probarRegistroGo } from '../../shared/kapsoPruebaRegistro.ts';
import { ErrorEntradaRegistroGo } from '../../shared/goErrorEntrada.ts';
import { iniciarAuditoriaGo } from '../../shared/goAuditoriaTurno.ts';
import { cerrarAuditoriaGo } from '../../shared/goAuditoriaCierre.ts';
import { serializarAuditoriaGo } from '../../shared/goAuditoriaStore.ts';

const MAX_REINTENTOS = 2;

export default async function (req: Request): Promise<Response> {
  if (req.method === 'GET') {
    return Response.json({
      ok: true,
      servicio: 'puente-kapso-go',
      agente: AGENTE_GO,
      ...estadoPuente(secrets.get('KAPSO_WEBHOOK_SECRET'), secrets.get('KAPSO_API_KEY')),
    });
  }

  try {
    const rawBody = await req.arrayBuffer();
    const firma = req.headers.get('x-webhook-signature');
    const idempotencyKey = req.headers.get('x-idempotency-key') || '';
    const evento = req.headers.get('x-webhook-event') || '';
    const secreto = secrets.get('KAPSO_WEBHOOK_SECRET');

    if (!secreto) return Response.json({ error: 'Webhook no configurado.' }, { status: 503 });

    if (!firma && req.headers.get('Authorization')) {
      const diagnostico = JSON.parse(new TextDecoder().decode(rawBody));
      if (['prueba_agente_go', 'prueba_interactiva_go', 'codiseno_onboarding_go', 'prueba_onboarding_go', 'prueba_registro_go'].includes(diagnostico.modo)) {
        const cliente = createClientFromRequest(req);
        const usuario = await cliente.auth.me();
        if (usuario?.role !== 'admin') return Response.json({ error: 'Solo administrador.' }, { status: 403 });
        if (diagnostico.modo === 'prueba_registro_go' &&
          ((diagnostico.grupo_id && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(diagnostico.grupo_id)) ||
           (diagnostico.sesion_id && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(diagnostico.sesion_id))))
          return Response.json({ error: 'Grupo o sesión inválidos.' }, { status: 400 });
        if (['prueba_interactiva_go', 'codiseno_onboarding_go', 'prueba_onboarding_go', 'prueba_registro_go'].includes(diagnostico.modo)) {
          const headers = new Headers(req.headers);
          headers.set('X-Data-Env', 'dev');
          const clientePrueba = createClientFromRequest(new Request(req.url, { headers }));
          if (diagnostico.modo === 'prueba_registro_go') return Response.json(await probarRegistroGo(clientePrueba, diagnostico));
          if (diagnostico.modo === 'prueba_onboarding_go') return Response.json(await probarOnboardingGo(clientePrueba, diagnostico));
          return Response.json(diagnostico.modo === 'codiseno_onboarding_go'
            ? await codisenarOnboardingGo(clientePrueba, diagnostico)
            : await probarRecorridoInteractivo(clientePrueba));
        }
        const pruebaId = crypto.randomUUID();
        const resultado = await invocarGoWhatsApp(cliente, {
          message_id: `prueba-go-${pruebaId}`, phone_number_id: GO_PHONE_NUMBER_ID,
          remite_numero: `prueba-${usuario.id}`, tipo_mensaje: 'texto',
          contenido_texto: 'Hola GO',
        }, { pruebaId });
        return Response.json({ ok: true, modo: 'prueba_agente_go', envio_whatsapp: false, ...resultado });
      }
    }

    const firmaValida = await verificarFirma(rawBody, firma, secreto);
    if (!firmaValida) return Response.json({ error: 'Firma inválida.' }, { status: 401 });

    const payload = JSON.parse(new TextDecoder().decode(rawBody));
    const isBatch = req.headers.get('x-webhook-batch') === 'true' || payload.batch === true;
    const payloads = isBatch ? (payload.data || []) : [payload];

    if (evento && evento !== EVENTO_MENSAJE_RECIBIDO) return Response.json({ ok: true, ignorado: evento });

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

      const existente = await base44.asServiceRole.entities.WebhookKapso.filter(
        { message_id: mensaje.message_id }, '-created_date', 1
      );
      if (existente.length > 0) {
        resultados.push({ message_id: mensaje.message_id, estado: 'duplicado' });
        continue;
      }

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
        es_test: false,
      });

      waitUntil((async () => {
        let reintentos = 0;
        let exito = false;
        let errorFinal = '';

        while (reintentos <= MAX_REINTENTOS && !exito) {
          try {
            const sesionId = `prod:${mensaje.remite_numero}`;
            const grupo = 'prod';
            const resultado = await serializarAuditoriaGo(`prod:${mensaje.message_id}`, async () => {
              const auditoria = await iniciarAuditoriaGo(base44, { ...registro, opcion_elegida: mensaje.opcion_elegida }, grupo, sesionId, 'prod');
              if (auditoria.duplicado) return { ...auditoria.resultado, idempotente: true };
              try {
                const res = await invocarGoWhatsApp(base44, { ...registro, opcion_elegida: mensaje.opcion_elegida }, {
                  registroContexto: { grupoPrueba: grupo, auditoria, etapa2: true, entorno: 'prod' } });
                const envio = await enviarRespuestaKapso(phoneId, mensaje, res.respuesta, true, res.opciones);
                if (!envio.ok) throw new Error(envio.error || 'No se pudo enviar la respuesta.');
                if (envio.message_id) res.respuesta_message_id = envio.message_id;
                return await cerrarAuditoriaGo(base44, auditoria, res, envio.message_id || '');
              } catch (e) {
                await auditoria.fallar(e);
                throw e;
              }
            });
            await base44.asServiceRole.entities.WebhookKapso.update(registro.id, {
              estado: 'respondido',
              respuesta_texto: resultado.opciones?.length ? JSON.stringify({ cuerpo: resultado.respuesta, opciones: resultado.opciones }) : resultado.respuesta,
              respuesta_message_id: resultado.wamid_salida || resultado.respuesta_message_id || '',
              error_detalle: '',
              reintentos,
            });
            exito = true;
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

    console.info('puenteKapsoGo: recepción aceptada', { cantidad: resultados.length });
    return Response.json({ ok: true, procesados: resultados });
  } catch (error) {
    if (error instanceof ErrorEntradaRegistroGo) return Response.json({ error: error.message, codigo: 'ENTRADA_INVALIDA' }, { status: 400 });
    console.error('puenteKapsoGo: recepción fallida', { nombre: error.name, mensaje: error.message });
    return Response.json({ error: error.message || 'Error interno.' }, { status: 500 });
  }
}