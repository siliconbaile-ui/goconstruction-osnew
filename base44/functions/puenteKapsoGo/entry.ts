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

const MODELO_GO = 'gpt_5_6_sol';
const MAX_REINTENTOS = 2;

// Procesa el mensaje: lo enruta al agente GO y devuelve la respuesta por Kapso.
async function procesarMensaje(base44: any, registro: any): Promise<{ respuesta: string; error?: string }> {
  try {
    const contenido = registro.transcripcion || registro.contenido_texto || '(mensaje multimedia recibido)';
    const prompt = `Conversación WhatsApp entrante de ${registro.remite_numero || 'contacto nuevo'}.\n` +
      `Tipo: ${registro.tipo_mensaje}.\n` +
      `Contenido: ${contenido}\n\n` +
      `Respondes como GO (jefe técnico digital de GoConstruction OS). Tonos: viaje profesional, inicio que capta, una pregunta de alto valor por turno, reflejar lo entendido, mínima evidencia siguiente, próximo paso claro, sin promesas fuera de tus herramientas. ` +
      `Máximo dos líneas. Sin tablas ni markdown. El contacto es nuevo: no asumas acceso a datos privados hasta identificar obra y contexto.`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: MODELO_GO,
    });
    const respuesta = typeof llmRes === 'string' ? llmRes : (llmRes?.response || llmRes?.text || JSON.stringify(llmRes));
    return { respuesta: String(respuesta).slice(0, 4000) };
  } catch (e) {
    return { respuesta: '', error: e.message };
  }
}

export default async function (req: Request): Promise<Response> {
  // ---- Health check (GET) ----
  if (req.method === 'GET') {
    return Response.json({
      ok: true,
      servicio: 'puente-kapso-go',
      ...estadoPuente(secrets.get('KAPSO_WEBHOOK_SECRET'), secrets.get('KAPSO_API_KEY')),
    });
  }

  try {
    // ---- 1. Leer raw body y headers ----
    const rawBody = await req.text();
    const firma = req.headers.get('x-webhook-signature');
    const idempotencyKey = req.headers.get('x-idempotency-key') || '';
    const evento = req.headers.get('x-webhook-event') || '';
    const secreto = secrets.get('KAPSO_WEBHOOK_SECRET');

    if (!secreto) {
      return Response.json({ error: 'Webhook no configurado.' }, { status: 503 });
    }

    // ---- 2. Verificar firma HMAC-SHA256 ----
    const firmaValida = await verificarFirma(rawBody, firma, secreto);
    if (!firmaValida) {
      return Response.json({ error: 'Firma inválida.' }, { status: 401 });
    }

    // ---- 3. Parsear y filtrar por evento y phone_number_id ----
    const payload = JSON.parse(rawBody);
    const isBatch = req.headers.get('x-webhook-batch') === 'true' || payload.batch === true;
    const payloads = isBatch ? (payload.data || []) : [payload];

    if (!isBatch && evento && evento !== EVENTO_MENSAJE_RECIBIDO) {
      return Response.json({ ok: true, ignorado: evento });
    }

    const base44 = createClientFromRequest(req);
    const apiKeyKapso = secrets.get('KAPSO_API_KEY');
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

      // ---- 6. Procesar y responder (modo test: no envía real) ----
      waitUntil((async () => {
        let reintentos = 0;
        let exito = false;
        let errorFinal = '';

        while (reintentos <= MAX_REINTENTOS && !exito) {
          try {
            const { respuesta, error } = await procesarMensaje(base44, registro);
            if (error) throw new Error(error);
            const envio = await enviarRespuestaKapso(phoneId, mensaje, respuesta, false);
            await base44.asServiceRole.entities.WebhookKapso.update(registro.id, {
              estado: envio.ok ? 'respondido' : 'error',
              respuesta_texto: respuesta,
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

    return Response.json({ ok: true, procesados: resultados });
  } catch (error) {
    return Response.json({ error: error.message || 'Error interno.' }, { status: 500 });
  }
}