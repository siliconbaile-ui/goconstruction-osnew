import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// WAV silencioso para desbloquear el audio en el mismo gesto del usuario
// (los navegadores móviles bloquean audio que no nace de un toque).
const SILENCIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQQAAAAAAA==';

let audioCompartido = null;

// Llamar SIEMPRE dentro de un click/toque del usuario (activar voz, enviar nota de voz).
export function desbloquearVoz() {
  if (!audioCompartido) audioCompartido = new Audio();
  audioCompartido.src = SILENCIO;
  audioCompartido.play().then(() => audioCompartido.pause()).catch(() => {});
}

function limpiarTexto(contenido) {
  return contenido
    .split('\n')
    .filter(l => !/^\s*\|?[-:| ]+\|?\s*$/.test(l)) // separadores de tabla
    .join('. ')
    .replace(/\|/g, ', ')
    .replace(/[*_#`>~]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/🟢/g, 'verde').replace(/🟡/g, 'amarillo').replace(/🔴/g, 'rojo')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 900);
}

// Lee en voz alta la última respuesta de Orion con voz neuronal Chirp3-HD
// (español latino, registro de obra). Espera a que el streaming termine,
// usa un elemento de audio desbloqueado y cae a la voz nativa si Google falla.
function useVoiceOutput(messages, activo, voz = 'river') {
  const ultimoLeido = useRef(null);
  const textosLeidos = useRef([]); // últimos textos ya hablados: evita repetir lo mismo
  const timerRef = useRef(null);
  const activadoRef = useRef(false);
  const [hablando, setHablando] = useState(false);

  // Al activar el modo voz no releemos el historial: solo lo que llegue después.
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

    // La respuesta llega en streaming: hablamos solo cuando el texto
    // lleva 1.2s sin cambiar (respuesta completa).
    clearTimeout(timerRef.current);
    const contenido = ultimo.content;
    timerRef.current = setTimeout(async () => {
      if (ultimoLeido.current === key) return;
      ultimoLeido.current = key;
      const texto = limpiarTexto(contenido);
      if (!texto) return;
      // Nunca repetir un texto ya leído (mensajes duplicados del mismo turno).
      if (textosLeidos.current.includes(texto)) return;
      textosLeidos.current = [...textosLeidos.current.slice(-4), texto];

      setHablando(true);
      try {
        let src = null;
        try {
          const { data } = await base44.functions.invoke('vozOrion', { texto, voz });
          if (data?.audio_base64) src = `data:audio/mp3;base64,${data.audio_base64}`;
        } catch { src = null; }
        if (!src) {
          const { url } = await base44.integrations.Core.GenerateSpeech({
            text: texto, voice: voz, language_code: 'es',
          });
          src = url;
        }
        if (!src) throw new Error('sin audio');

        if (!audioCompartido) audioCompartido = new Audio();
        audioCompartido.pause();
        audioCompartido.src = src;
        audioCompartido.onended = () => setHablando(false);
        audioCompartido.onerror = () => setHablando(false);
        await audioCompartido.play();
      } catch {
        // Último recurso: voz nativa del navegador en español.
        try {
          const u = new SpeechSynthesisUtterance(limpiarTexto(contenido));
          u.lang = 'es-CL';
          u.rate = 1.05;
          u.onend = () => setHablando(false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } catch {
          setHablando(false);
        }
      }
    }, 1200);

    return () => clearTimeout(timerRef.current);
  }, [messages, activo, voz]);

  useEffect(() => {
    if (!activo) {
      audioCompartido?.pause();
      window.speechSynthesis?.cancel();
      setHablando(false);
    }
  }, [activo]);

  const detener = () => {
    audioCompartido?.pause();
    window.speechSynthesis?.cancel();
    setHablando(false);
  };

  return { hablando, detener };
}

export default useVoiceOutput;
export { useVoiceOutput };