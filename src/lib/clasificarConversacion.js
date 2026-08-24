import { base44 } from '@/api/base44Client';

const ESQUEMA = {
  type: 'object',
  properties: {
    titulo: { type: 'string' },
    categoria: {
      type: 'string',
      enum: ['calidad', 'avance', 'rdi', 'pagos', 'alertas', 'normativa', 'documentos', 'producto', 'general'],
    },
    etiquetas: { type: 'array', items: { type: 'string' } },
    resumen: { type: 'string' },
  },
  required: ['titulo', 'categoria', 'etiquetas'],
};

// Clasifica una conversación de GO con IA y persiste (crea o actualiza) su
// ConversacionMeta: título automático, categoría, etiquetas y resumen.
export default async function clasificarConversacion(conversacionId, messages, metaExistente = null) {
  const transcripcion = messages
    .filter(m => m.content)
    .slice(-14)
    .map(m => `${m.role === 'user' ? 'USUARIO' : 'GO'}: ${String(m.content).slice(0, 500)}`)
    .join('\n');
  if (!transcripcion) return null;

  const r = await base44.integrations.Core.InvokeLLM({
    prompt: `Clasifica esta conversación de un asistente de gestión de obras de construcción en Chile.\n\nDevuelve:\n- titulo: máximo 6 palabras, en español, específico y técnico (ej: "NC enfierradura losa 3", "EDP bloqueado subcontrato Pinto"). Sin comillas.\n- categoria: la más representativa.\n- etiquetas: 2 a 4 etiquetas cortas en minúscula (partida, especialidad, tipo de gestión).\n- resumen: una sola frase con lo resuelto o pendiente.\n\nCONVERSACIÓN:\n${transcripcion}`,
    response_json_schema: ESQUEMA,
  });

  const datos = {
    conversacion_id: conversacionId,
    titulo: (r.titulo || '').slice(0, 80),
    categoria: r.categoria || 'general',
    etiquetas: (r.etiquetas || []).slice(0, 4),
    resumen: (r.resumen || '').slice(0, 300),
    mensajes_clasificados: messages.length,
    ultima_actividad: new Date().toISOString(),
  };

  const guardado = metaExistente
    ? await base44.entities.ConversacionMeta.update(metaExistente.id, datos)
    : await base44.entities.ConversacionMeta.create(datos);
  return guardado || { ...metaExistente, ...datos };
}