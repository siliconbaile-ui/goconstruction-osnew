import { useEffect, useRef, useState } from 'react';
import { reproducirTexto, detenerAudio, desbloquearAudio, limpiarParaVoz } from '@/lib/hablarTexto';

// Llamar SIEMPRE dentro de un click/toque del usuario (activar voz, enviar nota de voz).
export function desbloquearVoz() {
  desbloquearAudio();
}

// Lee en voz alta la última respuesta de GO con voz masculina técnica.
// Espera a que el streaming se estabilice (el texto deja de crecer) para no
// hablar sobre una respuesta a medio escribir, y nunca repite lo ya leído.
function useVoiceOutput(messages, activo, voz = 'storm') {
  const ultimoLeido = useRef(null);
  const textosLeidos = useRef([]);
  const timerRef = useRef(null);
  const activadoRef = useRef(false);
  const [hablando, setHablando] = useState(false);

  useEffect(() => {
    if (activo && !activadoRef.current) {
      activadoRef.current = true;
      const asistentes = messages.filter(m => m.role !== 'user' && m.content);
      const ultimo = asistentes[asistentes.length - 1];
      if (ultimo) ultimoLeido.current = ultimo.id || ultimo.created_date;
    }
    if (!activo) activadoRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo]);

  useEffect(() => {
    if (!activo) return;
    const asistentes = messages.filter(m => m.role !== 'user' && m.content);
    const ultimo = asistentes[asistentes.length - 1];
    if (!ultimo) return;
    const key = ultimo.id || ultimo.created_date;
    if (!key || ultimoLeido.current === key) return;

    // El texto llega en streaming: hablamos recién cuando lleva 2.5s sin cambiar,
    // así se lee el mensaje completo y no las primeras palabras.
    clearTimeout(timerRef.current);
    const contenido = ultimo.content;
    timerRef.current = setTimeout(async () => {
      if (ultimoLeido.current === key) return;
      const texto = limpiarParaVoz(contenido);
      if (!texto) return;
      if (textosLeidos.current.includes(texto)) return;
      ultimoLeido.current = key;
      textosLeidos.current = [...textosLeidos.current.slice(-4), texto];
      setHablando(true);
      await reproducirTexto(texto, () => setHablando(false), voz);
    }, 2500);

    return () => clearTimeout(timerRef.current);
  }, [messages, activo, voz]);

  useEffect(() => {
    if (!activo) {
      detenerAudio();
      setHablando(false);
    }
  }, [activo]);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    detenerAudio();
  }, []);

  const detener = () => {
    clearTimeout(timerRef.current);
    detenerAudio();
    setHablando(false);
  };

  return { hablando, detener };
}

export default useVoiceOutput;
export { useVoiceOutput };