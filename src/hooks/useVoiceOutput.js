import { useEffect, useRef } from 'react';

// Lee en voz alta la última respuesta del asistente cuando el modo voz está activo.
export default function useVoiceOutput(messages, activo) {
  const ultimoLeido = useRef(null);

  useEffect(() => {
    if (!activo || !window.speechSynthesis) return;
    const asistentes = messages.filter(m => m.role !== 'user' && m.content);
    const ultimo = asistentes[asistentes.length - 1];
    if (!ultimo) return;
    const key = ultimo.id || ultimo.created_date;
    if (!key || ultimoLeido.current === key) return;
    ultimoLeido.current = key;
    const texto = ultimo.content
      .replace(/\|/g, ' ')
      .replace(/[*_#`>-]/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 600);
    if (!texto.trim()) return;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-CL';
    u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [messages, activo]);

  useEffect(() => {
    if (!activo && window.speechSynthesis) window.speechSynthesis.cancel();
  }, [activo]);
}