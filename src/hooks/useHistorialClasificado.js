import { useCallback, useEffect, useRef, useState } from 'react';
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

// Historial persistente de GO: cada conversación queda guardada y la IA le pone
// título, categoría y etiquetas según lo que se conversó. Nunca se elimina.
export default function useHistorialClasificado(conversations, activeId, messages) {
  const [metas, setMetas] = useState({});
  const clasificando = useRef(new Set());
  const timerRef = useRef(null);

  const cargar = useCallback(async () => {
    const registros = await base44.entities.ConversacionMeta.list('-ultima_actividad', 200);
    const mapa = {};
    registros.forEach(r => { if (!mapa[r.conversacion_id]) mapa[r.conversacion_id] = r; });
    setMetas(mapa);
    return mapa;
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!activeId || messages.length < 2) return;
    const meta = metas[activeId];
    // Reclasifica cuando la conversación creció al menos 4 mensajes desde la última vez.
    if (meta && messages.length - (meta.mensajes_clasificados || 0) < 4) return;
    if (clasificando.current.has(activeId)) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      clasificando.current.add(activeId);
      try {
        const transcripcion = messages
          .filter(m => m.content)
          .slice(-14)
          .map(m => `${m.role === 'user' ? 'USUARIO' : 'GO'}: ${String(m.content).slice(0, 500)}`)
          .join('\n');

        const r = await base44.integrations.Core.InvokeLLM({
          prompt: `Clasifica esta conversación de un asistente de gestión de obras de construcción en Chile.\n\nDevuelve:\n- titulo: máximo 6 palabras, en español, específico y técnico (ej: "NC enfierradura losa 3", "EDP bloqueado subcontrato Pinto"). Sin comillas.\n- categoria: la más representativa.\n- etiquetas: 2 a 4 etiquetas cortas en minúscula (partida, especialidad, tipo de gestión).\n- resumen: una sola frase con lo resuelto o pendiente.\n\nCONVERSACIÓN:\n${transcripcion}`,
          response_json_schema: ESQUEMA,
        });

        const datos = {
          conversacion_id: activeId,
          titulo: (r.titulo || '').slice(0, 80),
          categoria: r.categoria || 'general',
          etiquetas: (r.etiquetas || []).slice(0, 4),
          resumen: (r.resumen || '').slice(0, 300),
          mensajes_clasificados: messages.length,
          ultima_actividad: new Date().toISOString(),
        };

        const guardado = meta
          ? await base44.entities.ConversacionMeta.update(meta.id, datos)
          : await base44.entities.ConversacionMeta.create(datos);
        setMetas(prev => ({ ...prev, [activeId]: guardado || { ...meta, ...datos } }));
      } finally {
        clasificando.current.delete(activeId);
      }
    }, 4000);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, messages.length]);

  return metas;
}