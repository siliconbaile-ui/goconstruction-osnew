import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

export default function PublicGoDictation({ onText, disabled }) {
  const recognition = useRef(null), [active, setActive] = useState(false), [error, setError] = useState('');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  useEffect(() => () => { if (recognition.current) { recognition.current.onresult = null; recognition.current.onend = null; recognition.current.onerror = null; recognition.current.abort(); } }, []);
  if (!Recognition) return null;
  const toggle = () => {
    if (active) { recognition.current?.stop(); return; }
    setError('');
    const rec = new Recognition(); recognition.current = rec;
    rec.lang = 'es-CL'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = event => onText(Array.from(event.results).map(result => result[0].transcript).join(' '));
    rec.onend = () => setActive(false);
    rec.onerror = () => { setError('No se pudo usar el micrófono. Revisa el permiso o escribe tu consulta.'); setActive(false); };
    try { rec.start(); setActive(true); } catch { setError('No se pudo iniciar el dictado. Escribe tu consulta.'); }
  };
  return <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={disabled && !active} onClick={toggle} aria-label={active ? 'Detener dictado' : 'Dictar consulta'} aria-pressed={active} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-primary disabled:opacity-40">{active ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>{error && <span role="alert" className="max-w-48 text-xs text-destructive">{error}</span>}</div>;
}