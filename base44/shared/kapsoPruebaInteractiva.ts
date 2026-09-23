import { invocarGoWhatsApp, AGENTE_GO } from './kapsoGoNarrativa.ts';
import { GO_PHONE_NUMBER_ID, normalizarMensaje, enviarRespuestaKapso } from './kapsoPuente.ts';

// Diagnóstico sintético administrativo. Nunca envía mensajes ni crea registros de webhook.
export async function probarRecorridoInteractivo(base44) {
  const pruebaId = crypto.randomUUID();
  const opcionesPrueba = { pruebaId };
  const inicio = normalizarMensaje({ conversation: { id: `prueba-${pruebaId}` }, message: {
    id: `prueba-inicio-${pruebaId}`, from: '12025550123', type: 'text', text: { body: 'Hola GO' },
  } }, GO_PHONE_NUMBER_ID);
  const primero = await invocarGoWhatsApp(base44, inicio, opcionesPrueba);
  const saludo = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, inicio, primero.respuesta, false, primero.opciones);
  const botones = saludo.test_payload?.body?.interactive?.action?.buttons || [];
  if (!saludo.ok || botones.length !== 2 || !botones.some(b => b.reply.title === 'Ver recorrido')
    || !botones.some(b => b.reply.title === 'Iniciar onboarding'))
    throw new Error('La bienvenida no presentó los dos caminos interactivos.');
  const elegido = botones.find(b => b.reply.title === 'Ver recorrido').reply;
  const seleccion = normalizarMensaje({ conversation: { id: inicio.conversation_id }, message: {
    id: `prueba-seleccion-${pruebaId}`, from: inicio.remite_numero, type: 'interactive',
    interactive: { type: 'button_reply', button_reply: elegido },
  } }, GO_PHONE_NUMBER_ID);
  const segundo = await invocarGoWhatsApp(base44, seleccion, opcionesPrueba);
  const repetido = await invocarGoWhatsApp(base44, seleccion, opcionesPrueba);
  if (repetido.agent_message_id !== segundo.agent_message_id) throw new Error('El reintento duplicó el turno.');
  if (segundo.agente !== AGENTE_GO || segundo.agent_conversation_id !== primero.agent_conversation_id)
    throw new Error('El recorrido no continuó con el mismo GO.');
  const metricas = [primero, segundo].map(t => ({ caracteres: t.respuesta.length, lineas: t.respuesta.split('\n').length,
    preguntas: (t.respuesta.match(/\?/g) || []).length, botones: t.opciones.length }));
  if (metricas.some(m => m.caracteres > 360 || m.lineas > 3 || m.preguntas > 1 || m.botones > 3))
    throw new Error('El recorrido no cumple el formato breve de WhatsApp.');
  return { ok: true, data_env: 'dev', modo: 'prueba_interactiva_go', envio_whatsapp: false, agente: AGENTE_GO,
    prueba_id: pruebaId, agent_conversation_id: primero.agent_conversation_id,
    transcripcion: [{ usuario: 'Hola GO', go: primero.respuesta, botones: primero.opciones },
      { usuario: elegido.title, go: segundo.respuesta, botones: segundo.opciones }],
    metricas, verificaciones: { dos_caminos: true, mismo_agente: true, reintento_sin_duplicar: true,
      mensajes_cortos: true } };
}