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
  if (primero.opciones.length || !/jefe técnico/i.test(primero.respuesta) || !/hoy/i.test(primero.respuesta))
    throw new Error('La bienvenida debe presentarse naturalmente y preguntar por hoy, sin menú.');
  const libre = normalizarMensaje({ conversation: { id: inicio.conversation_id }, message: {
    id: `prueba-libre-${pruebaId}`, from: inicio.remite_numero, type: 'text',
    text: { body: 'En obra Los Olmos faltan materiales para mañana. Puedo revisar la entrega con bodega o pedir una alternativa al encargado; déjame elegir cómo seguir.' },
  } }, GO_PHONE_NUMBER_ID);
  const segundo = await invocarGoWhatsApp(base44, libre, opcionesPrueba);
  const envio = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, libre, segundo.respuesta, false, segundo.opciones);
  const botones = envio.test_payload?.body?.interactive?.action?.buttons || [];
  if (!envio.ok || botones.length !== 2) throw new Error('La decisión operativa no conservó sus dos opciones naturales.');
  const elegido = botones[0].reply;
  const seleccion = normalizarMensaje({ conversation: { id: inicio.conversation_id }, message: {
    id: `prueba-seleccion-${pruebaId}`, from: inicio.remite_numero, type: 'interactive',
    interactive: { type: 'button_reply', button_reply: elegido },
  } }, GO_PHONE_NUMBER_ID);
  const tercero = await invocarGoWhatsApp(base44, seleccion, opcionesPrueba);
  const repetido = await invocarGoWhatsApp(base44, seleccion, opcionesPrueba);
  if (repetido.agent_message_id !== tercero.agent_message_id) throw new Error('El reintento duplicó el turno.');
  const turnos = [primero, segundo, tercero];
  if (turnos.some(t => t.agente !== AGENTE_GO || t.agent_conversation_id !== primero.agent_conversation_id))
    throw new Error('El recorrido no continuó con GO en la misma conversación.');
  const metricas = turnos.map(t => ({ caracteres: t.respuesta.length, lineas: t.respuesta.split('\n').length,
    preguntas: (t.respuesta.match(/\?/g) || []).length, botones: t.opciones.length }));
  if (metricas.some(m => m.caracteres > 360 || m.lineas > 3 || m.preguntas > 1 || m.botones > 3))
    throw new Error('El recorrido no cumple mensajes breves con una pregunta como máximo.');
  if (turnos.some(t => /piloto|cotizaci[oó]n|demo|conocer GO|tengo un caso|retrabajos|conversi[oó]n/i.test(t.respuesta)))
    throw new Error('El recorrido insertó lenguaje ajeno a la ayuda operativa.');
  return { ok: true, data_env: 'dev', modo: 'prueba_interactiva_go', envio_whatsapp: false, agente: AGENTE_GO,
    prueba_id: pruebaId, agent_conversation_id: primero.agent_conversation_id,
    transcripcion: turnos.map((t, i) => ({ usuario: [inicio.contenido_texto, libre.contenido_texto, elegido.title][i],
      go: t.respuesta, botones: t.opciones.map(o => ({ titulo: o.title, intencion: o.opcion })) })),
    metricas, agent_message_ids: turnos.map(t => t.agent_message_id),
    verificaciones: { inicio_sin_menu: true, misma_conversacion: true, reintento_sin_duplicar: true,
      mensajes_cortos: true, decision_operativa_interactiva: true } };
}