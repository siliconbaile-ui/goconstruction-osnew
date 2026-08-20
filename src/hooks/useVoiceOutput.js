import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Lee en voz alta la última respuesta de Orion con el perfil de voz "river".
export default function useVoiceOutput(messages, activo) {
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
        const { url } = await base44.integrations.Core.GenerateSpeech({
          text: texto,
          voice: 'river',
          language_code: 'es',
        });
        if (cancelado || !url) return;
        audioRef.current?.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setHablando(false);
        await audio.play();
      } catch {
        setHablando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [messages, activo]);

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