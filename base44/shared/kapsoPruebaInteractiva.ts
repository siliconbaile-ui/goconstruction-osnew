import { invocarGoWhatsApp, AGENTE_GO } from './kapsoGoNarrativa.ts';
import { GO_PHONE_NUMBER_ID, normalizarMensaje, enviarRespuestaKapso } from './kapsoPuente.ts';

// Diagnóstico sintético administrativo. Nunca envía mensajes ni crea registros de webhook.
export async function probarRecorridoInteractivo(base44) {
  const pruebaId = crypto.randomUUID();
  const opcionesPrueba = { pruebaId };
  const inicio = normalizarMensaje({ conversation: { id: `prueba-${pruebaId}` }, message: {
    id: `prueba-inicio-${pruebaId}`, from: '12025550123', type: 'text',
    text: { body: 'Hola GO' },
  } }, GO_PHONE_NUMBER_ID);
  const primero = await invocarGoWhatsApp(base44, inicio, opcionesPrueba);
  const enviado = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, inicio, primero.respuesta, false, primero.opciones);
  const outbound = enviado.test_payload?.body;
  const botones = outbound?.interactive?.action?.buttons || [];
  if (!enviado.ok || outbound?.type !== 'interactive' || outbound.interactive.type !== 'button' || botones.length !== 2)
    throw new Error('El inicio no ofreció las dos intenciones: ayuda concreta y conocer GO.');
  const etiquetas = ['Tengo un caso', 'Quiero conocer GO'];
  if (botones.some((boton, indice) => boton.reply.title !== etiquetas[indice]))
    throw new Error('La bienvenida no ofreció las etiquetas humanas del recorrido.');
  const elegido = botones[1].reply;
  const payloadSeleccion = { phone_number_id: GO_PHONE_NUMBER_ID, conversation: { id: inicio.conversation_id }, message: {
    id: `prueba-seleccion-${pruebaId}`, from: inicio.remite_numero, type: 'interactive',
    interactive: { type: 'button_reply', button_reply: elegido },
  } };
  const seleccion = normalizarMensaje(payloadSeleccion, GO_PHONE_NUMBER_ID);
  const segundo = await invocarGoWhatsApp(base44, seleccion, opcionesPrueba);
  if (segundo.agente !== AGENTE_GO || segundo.agent_conversation_id !== primero.agent_conversation_id)
    throw new Error('La selección no continuó con GO en la misma conversación.');
  const repetido = await invocarGoWhatsApp(base44, seleccion, opcionesPrueba);
  if (repetido.agent_message_id !== segundo.agent_message_id) throw new Error('El reintento duplicó el turno.');
  const metricas = [primero, segundo].map(turno => ({
    caracteres: turno.respuesta.length, lineas: turno.respuesta.split('\n').length,
    preguntas: (turno.respuesta.match(/\?/g) || []).length, botones: turno.opciones.length,
  }));
  if (metricas.some(m => m.caracteres > 360 || m.lineas > 3 || m.preguntas > 1 || m.botones > 3))
    throw new Error('El recorrido no cumple mensajes cortos con una sola pregunta y hasta tres botones.');
  if (/resistencia|conformidad|estabilidad|acredita/i.test(primero.respuesta))
    throw new Error('La bienvenida contiene un aviso técnico fuera de contexto.');
  if (!/GO|jefatura|GoConstruction/i.test(segundo.respuesta) || !/ejemplo/i.test(segundo.respuesta)
    || /partimos por el piso|qué (?:situación|problema) necesitas resolver hoy/i.test(segundo.respuesta))
    throw new Error('El descubrimiento no explicó GO e invitó a un ejemplo antes de pedir un problema.');
  const siguiente = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, seleccion, segundo.respuesta, false, segundo.opciones);
  if (!siguiente.ok) throw new Error('La explicación comercial no produjo un mensaje válido.');
  return { ok: true, modo: 'prueba_interactiva_go', envio_whatsapp: false, agente: AGENTE_GO,
    agent_conversation_id: primero.agent_conversation_id, continuacion_conversation_id: segundo.agent_conversation_id,
    transcripcion: { persona: inicio.contenido_texto, bienvenida: primero.respuesta,
      seleccion: elegido.title, explicacion_producto: segundo.respuesta },
    metricas, outbound, continuacion_tipo: siguiente.test_payload.body.type,
    agent_message_ids: [primero.agent_message_id, segundo.agent_message_id],
    verificaciones: { apertura_dos_intenciones: true, misma_conversacion: true,
      reintento_sin_duplicar: true, mensajes_cortos: true, bienvenida_sin_disclaimer: true, sin_repetir_menu: true },
  };
}