import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Lee en voz alta la última respuesta de Orion con voz neuronal profesional
// de Google Cloud (español latinoamericano). Si Google falla, usa la voz nativa.
function useVoiceOutput(messages, activo, voz = 'river') {
  const ultimoLeido = useRef(null);
  const audioRef = useRef(null);
  const [hablando, setHablando] = useState(false);

  useEffect(() => {
    if (!activo) return;
    const asistentes = messages.filter(m => m.role !== 'user' && m.content);
    const ultimo = asistentes[asistentes.length - 1];
    if (!ultimo) return;
    const key = ultimo.id || ultimo.created_date;
    if (!key || ultimoLeido.current === key) return;
    ultimoLeido.current = key;

    const texto = ultimo.content
      .replace(/\|/g, ' ')
      .replace(/[*_#`>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 900);
    if (!texto) return;

    let cancelado = false;
    (async () => {
      setHablando(true);
      try {
        let src = null;
        try {
          const { data } = await base44.functions.invoke('vozOrion', { texto, voz });
          if (data?.audio_base64) src = `data:audio/mp3;base64,${data.audio_base64}`;
        } catch {
          src = null;
        }
        if (!src) {
          const { url } = await base44.integrations.Core.GenerateSpeech({
            text: texto, voice: voz, language_code: 'es',
          });
          src = url;
        }
        if (cancelado || !src) return;
        audioRef.current?.pause();
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.onended = () => setHablando(false);
        await audio.play();
      } catch {
        setHablando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [messages, activo, voz]);

  useEffect(() => {
    if (!activo && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setHablando(false);
    }
  }, [activo]);

  const detener = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setHablando(false);
  };

  return { hablando, detener };
}

export default useVoiceOutput;
export { useVoiceOutput };