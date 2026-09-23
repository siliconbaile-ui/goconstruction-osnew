import { invocarGoWhatsApp } from './kapsoGoNarrativa.ts';
import { GO_PHONE_NUMBER_ID, normalizarMensaje, enviarRespuestaKapso } from './kapsoPuente.ts';
import { CASOS_GO, entradaPruebaGo } from './kapsoEscenariosGo.ts';
import { interpretarSalidaGo } from './kapsoInteractivo.ts';
import { leerSeguimientoGo } from './kapsoRecorridoGo.ts';

// Solo desde la ruta diagnóstica admin, con cliente forzado a Test. No hace envíos a Kapso.
export async function probarOnboardingGo(base44, input) {
  const caso = input.caso || 'bienvenida';
  if (!CASOS_GO.includes(caso)) throw new Error('Caso no permitido.');
  if (caso !== 'bienvenida' && !input.prueba_id) throw new Error('Falta la sesión iniciada en desarrollo.');
  const pruebaId = input.prueba_id || crypto.randomUUID();
  if (!/^[a-f0-9-]{36}$/.test(pruebaId)) throw new Error('Identificador de prueba inválido.');
  const db = base44.entities;
  const codigo = `GO-QA-${pruebaId}`;
  let proyecto = (await db.ProyectoObra.filter({ codigo, es_demo: true }, '-created_date', 1))[0];
  if (!proyecto && caso !== 'bienvenida') throw new Error('La obra de prueba no existe en desarrollo.');
  if (!proyecto) proyecto = await db.ProyectoObra.create({ codigo, nombre: `Obra de prueba GO ${pruebaId.slice(0, 8)}`,
    es_demo: true, estado: 'configuracion', descripcion: 'Fixture sintético de onboarding Kapso; no representa una obra real.' });
  let partida = (await db.PartidaControl.filter({ proyecto_id: proyecto.id, codigo: 'RAD-QA' }, '-created_date', 1))[0];
  if (!partida) partida = await db.PartidaControl.create({ proyecto_id: proyecto.id, codigo: 'RAD-QA', nombre: 'Radier del acceso norte',
    avance_real: 40, avance_programado: 60, estado: 'en_progreso', notas: 'Fixture sintético de desarrollo, sin efectos operacionales.' });
  const remitente = '12025550123';
  const agents = base44.agents;
  const anteriores = await agents.listConversations({ q: JSON.stringify({ agent_name: 'orion_asistente', 'metadata.canal': 'kapso_go',
    'metadata.phone_number_id': GO_PHONE_NUMBER_ID, 'metadata.remitente': remitente, 'metadata.prueba_id': pruebaId }), sort: '-created_date', limit: 1 });
  const anterior = anteriores.find(c => c.metadata?.prueba_id === pruebaId && c.agent_name === 'orion_asistente');
  let elegido;
  if (caso === 'boton_piso') {
    if (!anterior) throw new Error('Primero ejecuta bienvenida.');
    const historial = await agents.getConversation(anterior.id);
    const mensaje = historial.messages.find(m => m.role === 'assistant' && m.content?.includes('Sí, revisemos piso') && !m.tool_calls?.length);
    if (!mensaje) throw new Error('La nueva apertura no presupone piso; usa revisar_piso para declarar ese caso. boton_piso solo comprueba botones antiguos.');
    const opcion = interpretarSalidaGo(mensaje.content).opciones[0];
    if (!opcion || !/piso/i.test(opcion.titulo)) throw new Error('No hay botón de piso que pulsar.');
    elegido = { id: `go:${mensaje.id}:0`, title: opcion.titulo };
  }
  const payload = { phone_number_id: GO_PHONE_NUMBER_ID, conversation: { id: `qa-${pruebaId}` },
    message: { id: `onboarding-${pruebaId}-${caso}`, from: remitente, ...entradaPruebaGo(caso, proyecto, elegido) } };
  const entrada = normalizarMensaje(payload, GO_PHONE_NUMBER_ID);
  const respuesta = await invocarGoWhatsApp(base44, entrada, { pruebaId, alcancePrueba: { proyecto_id: proyecto.id, partida_id: partida.id } });
  const envio = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, entrada, respuesta.respuesta, false, respuesta.opciones);
  const conversacion = await agents.getConversation(respuesta.agent_conversation_id);
  const inicio = conversacion.messages.findIndex(m => m.role === 'user' && m.content?.includes(`[kapso_message_id:${entrada.message_id}]`));
  const final = conversacion.messages.findIndex(m => m.id === respuesta.agent_message_id);
  const herramientas = conversacion.messages.slice(inicio, final + 1).flatMap(m => (m.tool_calls || []).map(t => ({
    nombre: t.name, estado: t.status, argumentos: t.arguments_string,
    resultado: typeof t.results === 'string' ? t.results.slice(0, 850) : JSON.stringify(t.results)?.slice(0, 850),
  })));
  const metricas = { caracteres: respuesta.respuesta.length, lineas: respuesta.respuesta.split('\n').length,
    preguntas: (respuesta.respuesta.match(/\?/g) || []).length, botones: respuesta.opciones.length };
  const verificaciones = { corto: metricas.caracteres <= 360 && metricas.lineas <= 3, una_pregunta: metricas.preguntas <= 1,
    botones_validos: metricas.botones <= 3 && envio.ok,
    mismo_agente: conversacion.agent_name === 'orion_asistente', misma_conversacion: !anterior || anterior.id === conversacion.id,
    contexto_persistido: leerSeguimientoGo(conversacion)?.message_id === respuesta.agent_message_id,
    sin_herramientas_ajenas: caso !== 'otra_obra' || herramientas.length === 0 };
  return { ok: Object.values(verificaciones).every(Boolean), data_env: 'dev', caso, prueba_id: pruebaId,
    conversation_id: conversacion.id, agent_message_id: respuesta.agent_message_id,
    usuario: entrada.transcripcion || entrada.contenido_texto || `[${entrada.tipo_mensaje}]`, go: respuesta.respuesta,
    herramientas, metricas, verificaciones, seguimiento: respuesta.seguimiento,
    envio_whatsapp: false, outbound: envio.test_payload?.body,
    fixture: { proyecto_id: proyecto.id, partida_id: partida.id } };
}