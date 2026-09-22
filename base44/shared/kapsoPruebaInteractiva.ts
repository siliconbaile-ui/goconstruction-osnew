import { invocarGoWhatsApp, AGENTE_GO } from './kapsoGoNarrativa.ts';
import { GO_PHONE_NUMBER_ID, normalizarMensaje, enviarRespuestaKapso } from './kapsoPuente.ts';

// Diagnóstico sintético administrativo. Nunca envía mensajes ni crea registros de webhook.
export async function probarRecorridoInteractivo(base44) {
  const pruebaId = crypto.randomUUID();
  const opcionesPrueba = { pruebaId };
  const inicio = normalizarMensaje({ conversation: { id: `prueba-${pruebaId}` }, message: {
    id: `prueba-inicio-${pruebaId}`, from: '12025550123', type: 'text',
    text: { body: 'Hola GO. Quiero iniciar un recorrido profesional del piso y estado actual de una obra; todavía no he compartido fotos ni identificado la obra. ¿Qué opciones tengo para comenzar?' },
  } }, GO_PHONE_NUMBER_ID);
  const primero = await invocarGoWhatsApp(base44, inicio, opcionesPrueba);
  const enviado = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, inicio, primero.respuesta, false, primero.opciones);
  const outbound = enviado.test_payload?.body;
  const botones = outbound?.interactive?.action?.buttons || [];
  if (!enviado.ok || outbound.type !== 'interactive' || outbound.interactive.type !== 'button' || botones.length !== 3)
    throw new Error('El inicio del recorrido no produjo interactive con tres reply buttons.');
  const elegido = botones[0].reply;
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
  // Fixture de cuatro opciones: comprueba la rama de listas sin otra llamada al agente.
  const lista = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, inicio, 'Fixture: selecciona el siguiente control.', false,
    [...primero.opciones, { id: 'prueba-lista-cuarta', title: 'Otra toma', opcion: 'Otra toma' }]);
  const listado = lista.test_payload?.body;
  if (listado?.interactive?.type !== 'list' || listado.interactive.action.sections[0].rows.length !== 4)
    throw new Error('Cuatro opciones no produjeron list message.');
  const seleccionLista = normalizarMensaje({ ...payloadSeleccion, message: { ...payloadSeleccion.message,
    id: `prueba-lista-${pruebaId}`, interactive: { type: 'list_reply', list_reply: elegido },
  } }, GO_PHONE_NUMBER_ID);
  if (seleccionLista.opcion_elegida?.id !== elegido.id) throw new Error('No se normalizó list_reply.');
  return { ok: true, modo: 'prueba_interactiva_go', envio_whatsapp: false, agente: AGENTE_GO,
    agent_conversation_id: primero.agent_conversation_id, outbound,
    seleccion_normalizada: seleccion.contenido_texto, respuesta_continuacion: segundo.respuesta,
    continuacion_conversation_id: segundo.agent_conversation_id,
    agent_message_ids: [primero.agent_message_id, segundo.agent_message_id],
    verificaciones: { interactive_tres_botones: true, misma_conversacion: true,
      reintento_sin_duplicar: true, cuatro_opciones_list_message: true, list_reply_normalizado: true },
    lista_fixture: listado,
  };
}