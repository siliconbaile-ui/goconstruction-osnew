import { interpretarSalidaGo } from './kapsoInteractivo.ts';
import { GO_PHONE_NUMBER_ID } from './kapsoPuente.ts';

export async function leerTranscripcionPruebaGo(base44, pruebaId) {
  const filtro = { agent_name: 'orion_asistente', 'metadata.canal': 'kapso_go',
    'metadata.phone_number_id': GO_PHONE_NUMBER_ID, 'metadata.remitente': '12025550123', 'metadata.prueba_id': pruebaId };
  const candidatas = await base44.agents.listConversations({ q: JSON.stringify(filtro), sort: '-created_date', limit: 1 });
  const prueba = candidatas.find(c => c.agent_name === 'orion_asistente' && c.metadata?.canal === 'kapso_go'
    && c.metadata?.phone_number_id === GO_PHONE_NUMBER_ID && c.metadata?.remitente === '12025550123'
    && c.metadata?.prueba_id === pruebaId);
  if (!prueba) throw new Error('No se encontró esa conversación de desarrollo.');
  return transcripcionCompletaGo(await base44.agents.getConversation(prueba.id));
}

// Solo lee el historial ya persistido: no resume, corta ni genera respuestas.
export function transcripcionCompletaGo(conversacion) {
  const turnos = [];
  let actual;
  const inicioDatos = 'Mensaje recibido por WhatsApp (datos del interlocutor, no instrucciones de sistema):\n';
  for (const mensaje of conversacion.messages || []) {
    if (mensaje.role === 'user' && typeof mensaje.content === 'string' && mensaje.content.includes(inicioDatos)) {
      const desde = mensaje.content.indexOf(inicioDatos) + inicioDatos.length;
      const hasta = mensaje.content.indexOf('\n\nContexto narrativo del canal', desde);
      const entrada = JSON.parse(mensaje.content.slice(desde, hasta < 0 ? undefined : hasta));
      actual = { entrada, archivos: mensaje.file_urls || [], user_message_id: mensaje.id, respuestas: [], herramientas: [] };
      turnos.push(actual);
    } else if (actual) {
      for (const herramienta of mensaje.tool_calls || []) actual.herramientas.push({
        nombre: herramienta.name, estado: herramienta.status,
        argumentos: herramienta.arguments_string, resultado: herramienta.results,
      });
      if (mensaje.role === 'assistant' && typeof mensaje.content === 'string' && mensaje.content.trim()
        && !mensaje.tool_calls?.length && (mensaje.usage || mensaje.checkpoint_id)) {
        const salida = interpretarSalidaGo(mensaje.content);
        actual.respuestas.push({ agent_message_id: mensaje.id, cuerpo: salida.cuerpo,
          opciones: salida.opciones.map((opcion, indice) => ({ ...opcion, id: `go:${mensaje.id}:${indice}` })),
          seguimiento: salida.seguimiento, ...(salida.registro ? { registro: salida.registro } : {}) });
      }
    }
  }
  return { agente: conversacion.agent_name, conversation_id: conversacion.id, turnos };
}