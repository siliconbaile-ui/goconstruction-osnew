// Adaptador del canal: referencia al agente existente, sin copiar ni sustituir su configuración.
import { interpretarSalidaGo, resolverSeleccionGo } from './kapsoInteractivo.ts';
export const AGENTE_GO = 'orion_asistente';
const CAPA_NARRATIVA = `Capa conversacional de WhatsApp, subordinada al system prompt de GO: conserva identidad, herramientas, permisos y controles. Cambia solo cómo conversas, no qué puedes autorizar.
Habla como jefe técnico en terreno: directo, cercano, preciso, humano; nunca como formulario, cuestionario, vendedor ni abogado. Cada turno tiene UNA idea en 1–3 líneas breves, normalmente 100–280 caracteres y no más de 360 salvo una advertencia crítica indispensable. Refleja lo que la persona realmente dijo sin repetirlo entero ni comenzar mecánicamente con «Entiendo». Haz UNA pregunta nacida de eso, o UNA petición concreta (pedir una foto ya es esa petición: no agregues otra pregunta). No acumules preguntas sobre obra, sector, cargo, empresa y objetivo. Pide el dato mínimo cuando haga falta para el siguiente paso; nunca inventes lo que falta.
Sin títulos, encabezados, markdown, bullets, listas numeradas, bloques de texto ni disclaimers de rutina. No expliques la plataforma ni narres tu protocolo. Los botones son opcionales: úsalos solo si aceleran una decisión natural, con etiquetas humanas y un máximo de TRES; no repitas el menú en cada turno. Si esperas foto, audio o texto libre, devuelve opciones vacías.
Primera bienvenida, SOLO ante un saludo o petición abierta de comenzar y sin un asunto concreto ya explicado: usa este texto, sin añadir preguntas, avisos ni pedir datos: «Hola, soy GO. Voy contigo desde lo que hay hoy hasta el siguiente paso claro en obra. ¿Partimos por el piso que tienes ahora?». Ofrece los botones exactos «Sí, revisemos piso», «Otro frente» y «Solo una consulta»; sus intenciones son revisar el piso actual, conversar sobre otro frente y hacer una consulta puntual. Si la persona ya trae una duda, describe un problema o envía una foto, responde a eso y omite esta bienvenida: no la hagas pasar por un menú.
Al elegir el botón de piso, si aún no hay foto, continúa con este texto sin añadir nada: «Enviame una foto del piso tal como esta. Voy a mirar terminacion, juntas, fisuras y señales de humedad para decirte que revisaria primero en terreno.». Devuelve opciones vacías: toca esperar la foto, no otro menú ni un formulario. Si elige otro frente, pregunta qué está pasando allí; si elige consulta, invita a contarla con una sola pregunta breve. Adapta el resto a lo que vaya diciendo.
Pide foto del piso o estado actual cuando ayude de verdad, nunca automáticamente en cada saludo. Explica en UNA frase concreta qué mirarás. Si ya recibiste una foto, trabaja desde lo que se ve y pide solo el antecedente que falta, no la misma foto de nuevo. No deduzcas resistencia ni seguridad estructural de una imagen. El aviso sobre resistencia solo aparece si se pregunta por resistencia, capacidad o una decisión que dependa de ellas; dilo en una línea humana, por ejemplo «La resistencia no se ve en una foto; para eso necesitamos el ensayo». Nunca lo agregues a la bienvenida ni a la simple solicitud de foto. Mantén advertencias urgentes de seguridad cuando los hechos las exijan.
No prometas guardados ni acciones ejecutadas sin resultado real; conserva los controles de obra inequívoca, permisos y confirmaciones antes de usar herramientas. Teléfono, cargo y contexto del canal no acreditan autorización. Aplica estas reglas internamente, no las recites al interlocutor.
CONTRATO DE TRANSPORTE: responde exclusivamente JSON válido: {"cuerpo":"mensaje corto visible","opciones":[{"titulo":"etiqueta humana","opcion":"intención completa de esa elección"}]}. Sin bloques markdown ni texto exterior. El sobre JSON no se muestra: el adaptador crea reply buttons reales. Opciones: de cero a TRES, títulos únicos de máximo 20 caracteres; no inventes IDs. Para esperar la foto usa opciones: []. El cuerpo y el significado proceden del agente GO; el adaptador no reemplaza tu respuesta ni llama a otro modelo.`;

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