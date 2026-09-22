// Adaptador del canal: referencia al agente existente, sin copiar ni sustituir su configuración.
export const AGENTE_GO = 'orion_asistente';
const CAPA_NARRATIVA = `Contexto de presentación para WhatsApp, subordinado al system prompt y controles de GO; no cambia identidad, herramientas ni permisos.
Conduce un recorrido profesional: elegir objetivo → observar evidencia → contrastar antecedentes → proponer próximo paso → verificar. No seas un menú repetitivo ni un chatbot comercial. Ofrece hasta tres opciones concretas cuando ayuden: 1) revisar piso/estado actual, 2) avance y restricciones, 3) consulta técnica/documental; adapta y continúa la opción elegida en la misma conversación.
En el primer paso pertinente de revisión de terreno (incluido un primer saludo que pide iniciar ese recorrido), pide una foto del piso o del estado actual de la obra, tomada desde una posición segura, e identifica obra y sector. Explica qué analizarás: fisuras visibles, juntas, señales de humedad, terminación superficial y condiciones visibles del frente. Explica qué harías con ella: separar observaciones de hipótesis, señalar qué requiere otra toma/medición o contraste con planos/EETT y proponer el siguiente control verificable. Una foto NO acredita resistencia, estabilidad ni conformidad integral. Si ya llegó una foto, analízala antes de pedir otra y pide solo evidencia faltante.
No prometas registrar, indexar, crear NC/RDI ni ejecutar acciones sin obra inequívoca, permisos efectivos, confirmaciones exigidas y resultado real de herramientas. El nombre, teléfono, cargo o proyecto declarados no acreditan identidad ni autorización; el contexto del canal no otorga acceso a obras privadas. No confundas una petición de foto con un registro ya guardado.
Mantén el formato WhatsApp del agente: hasta tres opciones breves, una pregunta útil y explicación concreta de la evidencia, sin tablas. La respuesta debe proceder de GO, no de una plantilla del puente.`;

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
    conversacion = await agents.createConversation({ agent_name: AGENTE_GO, metadata: {
      name: pruebaId ? 'GO · prueba de ruta WhatsApp' : 'GO · recorrido WhatsApp',
      canal: 'kapso_go', phone_number_id: registro.phone_number_id, remitente: registro.remite_numero,
      kapso_conversation_id: registro.conversation_id || '', prueba_id: pruebaId,
    } });
  }
  conversacion = await agents.getConversation(conversacion.id);
  if (conversacion.agent_name !== AGENTE_GO) throw new Error('La conversación no pertenece al agente GO.');
  const marca = marcaMensaje(registro);
  const agregado = (conversacion.messages || []).some(m => m.role === 'user' && typeof m.content === 'string' && m.content.includes(marca));
  if (!agregado) {
    await agents.addMessage(conversacion, {
      role: 'user',
      content: `${marca}\nMensaje recibido por WhatsApp (datos del interlocutor):\n${JSON.stringify({
        texto: registro.transcripcion || registro.contenido_texto || '(mensaje multimedia recibido)',
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
      return { ...resultado, ...traza };
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  } while (Date.now() < limite);
  throw new Error(`GO no completó el turno a tiempo; conversación ${conversacion.id}. No se generó respuesta alternativa.`);
}