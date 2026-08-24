import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import clasificarConversacion from '@/lib/clasificarConversacion';

// Historial persistente de GO: TODA conversación queda guardada y clasificada.
// 1) La sesión activa se clasifica/reclasifica en vivo mientras crece.
// 2) Un barrido de fondo clasifica las sesiones que quedaron sin meta
//    (sesiones antiguas, de otros dispositivos o de WhatsApp).
export default function useHistorialClasificado(conversations, activeId, messages) {
  const [metas, setMetas] = useState({});
  const clasificando = useRef(new Set());
  const timerRef = useRef(null);
  const barrido = useRef(false);

  const cargar = useCallback(async () => {
    const registros = await base44.entities.ConversacionMeta.list('-ultima_actividad', 200);
    const mapa = {};
    registros.forEach(r => { if (!mapa[r.conversacion_id]) mapa[r.conversacion_id] = r; });
    setMetas(mapa);
    return mapa;
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Barrido de fondo: clasifica sesiones existentes sin meta (una sola vez por carga).
  useEffect(() => {
    if (barrido.current || conversations.length === 0) return;
    barrido.current = true;
    (async () => {
      const mapa = await cargar();
      const pendientes = conversations.filter(c => !mapa[c.id] && c.id !== activeId).slice(0, 6);
      for (const c of pendientes) {
        if (clasificando.current.has(c.id)) continue;
        clasificando.current.add(c.id);
        try {
          const conv = await base44.agents.getConversation(c.id);
          const msgs = conv?.messages || [];
          if (msgs.length >= 2) {
            const guardado = await clasificarConversacion(c.id, msgs, null);
            if (guardado) setMetas(prev => ({ ...prev, [c.id]: guardado }));
          }
        } catch (e) {
          console.error('clasificación pendiente falló', e);
        } finally {
          clasificando.current.delete(c.id);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length]);

  // Clasificación en vivo de la sesión activa.
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
        const guardado = await clasificarConversacion(activeId, messages, meta);
        if (guardado) setMetas(prev => ({ ...prev, [activeId]: guardado }));
      } catch (e) {
        console.error('clasificación en vivo falló', e);
      } finally {
        clasificando.current.delete(activeId);
      }
    }, 4000);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, messages.length]);

  return metas;
}