// Adaptador del canal: referencia al agente existente, sin copiar ni sustituir su configuración.
import { interpretarSalidaGo, resolverSeleccionGo } from './kapsoInteractivo.ts';
export const AGENTE_GO = 'orion_asistente';
const CAPA_NARRATIVA = `Contexto de presentación para WhatsApp, subordinado al system prompt y controles de GO; no cambia identidad, herramientas ni permisos.
Conduce un recorrido profesional: elegir objetivo → observar evidencia → contrastar antecedentes → proponer próximo paso → verificar. Al abrir el recorrido ofrece exactamente tres opciones interactivas: Revisar piso, Avance y plazos, Consulta técnica. Nunca escribas un menú 1) 2) 3) ni enumeres las opciones dentro del cuerpo: el adaptador las convierte en controles reales de WhatsApp. Tras una selección, refleja lo elegido y avanza en ese mismo hilo sin repetir el menú inicial; no inventes una acción ejecutada. Solo ofrece opciones pertinentes al paso actual; si esperas una foto o un dato, puedes devolver opciones vacías.
En el primer paso pertinente de revisión de terreno (incluido un primer saludo que pide iniciar ese recorrido), pide una foto del piso o del estado actual de la obra, tomada desde una posición segura, e identifica obra y sector. Explica qué analizarás: fisuras visibles, juntas, señales de humedad, terminación superficial y condiciones visibles del frente. Explica qué harías con ella: separar observaciones de hipótesis, señalar qué requiere otra toma/medición o contraste con planos/EETT y proponer el siguiente control verificable. Una foto NO acredita resistencia, estabilidad ni conformidad integral. Si ya llegó una foto, analízala antes de pedir otra y pide solo evidencia faltante.
No prometas registrar, indexar, crear NC/RDI ni ejecutar acciones sin obra inequívoca, permisos efectivos, confirmaciones exigidas y resultado real de herramientas. El nombre, teléfono, cargo o proyecto declarados no acreditan identidad ni autorización; el contexto del canal no otorga acceso a obras privadas. No confundas una petición de foto con un registro ya guardado.
El cuerpo visible es profesional y breve (objetivo 350–650 caracteres, máximo 1024): refleja en una frase lo entendido, explica el paso actual y, al iniciar la revisión, pide foto del piso/estado actual junto con obra y sector e indica qué analizarás y cuál será el siguiente control. No repitas literalmente la consulta. Evita encabezados, tablas, relleno y cierres comerciales. Conserva las advertencias técnicas necesarias. La respuesta y el significado de las opciones proceden de GO, nunca de una plantilla del puente.
CONTRATO DE TRANSPORTE: tu respuesta final para este canal es exclusivamente JSON válido, sin bloques markdown ni texto exterior: {"cuerpo":"texto visible al interlocutor","opciones":[{"titulo":"etiqueta corta","opcion":"intención completa que continuarás si la elige"}]}. El JSON es un sobre interno, no se muestra al usuario. Hasta 3 opciones se muestran como reply buttons (títulos únicos de máximo 20 caracteres); de 4 a 10 como list message (títulos únicos de máximo 24 caracteres). Nunca más de 10: divide el recorrido en pasos si fuese necesario. No escribas IDs: los genera el adaptador. Si no hay una elección útil, devuelve opciones: []. No alteres por este formato tus herramientas, controles ni autorizaciones.`;

function marcaMensaje(registro) {
  return `[kapso_message_id:${registro.message_id}]`;
}

function respuestaDelTurno(conversacion, marca) {
  const mensajes = conversacion.messages || [];
  const inicio = mensajes.findIndex(m => m.role === 'user' && typeof m.content === 'string' && m.content.includes(marca));
  if (inicio < 0) return null;
  const siguiente = mensajes.findIndex((m, i) => i > inicio && m.role === 'user');
  const turno = mensajes.slice(inicio + 1, siguiente < 0 ? undefined : siguiente);
  const ultimo = turno[turno.length - 1];
  if (ultimo?.role !== 'assistant' || typeof ultimo.content !== 'string' || !ultimo.content.trim()) return null;
  // No enviar anuncios de traspaso ni texto parcial mientras el agente ejecuta herramientas.
  if (ultimo.tool_calls?.length || (!ultimo.usage && !ultimo.checkpoint_id)) return null;
  return { respuesta: ultimo.content.trim(), agent_message_id: ultimo.id,
    herramientas: turno.flatMap(m => (m.tool_calls || []).map(t => ({ name: t.name, status: t.status }))) };
}

export async function invocarGoWhatsApp(base44, registro, { pruebaId = '' } = {}) {
  const agents = base44.asServiceRole.agents;
  const clave = {
    agent_name: AGENTE_GO,
    'metadata.canal': 'kapso_go',
    'metadata.phone_number_id': registro.phone_number_id,
    'metadata.remitente': registro.remite_numero,
    'metadata.prueba_id': pruebaId,
  };
  const candidatas = await agents.listConversations({ q: JSON.stringify(clave), sort: '-created_date', limit: 1 });
  let conversacion = candidatas.find(c => c.agent_name === AGENTE_GO && c.metadata?.canal === 'kapso_go'
    && c.metadata?.phone_number_id === registro.phone_number_id && c.metadata?.remitente === registro.remite_numero
    && c.metadata?.prueba_id === pruebaId);
  if (!conversacion) {
    if (registro.opcion_elegida?.id?.startsWith('go:')) throw new Error('No se encontró la conversación de la opción elegida.');
    conversacion = await agents.createConversation({ agent_name: AGENTE_GO, metadata: {
      name: pruebaId ? 'GO · prueba de ruta WhatsApp' : 'GO · recorrido WhatsApp',
      canal: 'kapso_go', phone_number_id: registro.phone_number_id, remitente: registro.remite_numero,
      kapso_conversation_id: registro.conversation_id || '', prueba_id: pruebaId,
    } });
  }
  conversacion = await agents.getConversation(conversacion.id);
  if (conversacion.agent_name !== AGENTE_GO) throw new Error('La conversación no pertenece al agente GO.');
  const textoElegido = registro.opcion_elegida?.id?.startsWith('go:')
    ? resolverSeleccionGo(conversacion, registro.opcion_elegida) : '';
  const marca = marcaMensaje(registro);
  const agregado = (conversacion.messages || []).some(m => m.role === 'user' && typeof m.content === 'string' && m.content.includes(marca));
  if (!agregado) {
    await agents.addMessage(conversacion, {
      role: 'user',
      content: `${marca}\nMensaje recibido por WhatsApp (datos del interlocutor):\n${JSON.stringify({
        texto: textoElegido || registro.transcripcion || registro.contenido_texto || '(mensaje multimedia recibido)',
        tipo: registro.tipo_mensaje, coordenadas_gps: registro.coordenadas_gps || '',
      })}\n\nContexto narrativo del canal (no sustituye tus instrucciones):\n${CAPA_NARRATIVA}`,
      ...(registro.archivo_url ? { file_urls: [registro.archivo_url] } : {}),
    });
  }
  const limite = Date.now() + 75000;
  do {
    conversacion = await agents.getConversation(conversacion.id);
    const resultado = respuestaDelTurno(conversacion, marca);
    if (resultado) {
      const traza = { agente: conversacion.agent_name, agent_conversation_id: conversacion.id,
        message_id: registro.message_id, agent_message_id: resultado.agent_message_id, herramientas: resultado.herramientas };
      console.info('puenteKapsoGo: respuesta del agente existente', traza);
      const salida = interpretarSalidaGo(resultado.respuesta);
      return { ...resultado, ...traza, respuesta: salida.cuerpo,
        opciones: salida.opciones.map((opcion, indice) => ({
          id: `go:${resultado.agent_message_id}:${indice}`, title: opcion.titulo, opcion: opcion.opcion,
        })) };
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  } while (Date.now() < limite);
  throw new Error(`GO no completó el turno a tiempo; conversación ${conversacion.id}. No se generó respuesta alternativa.`);
}