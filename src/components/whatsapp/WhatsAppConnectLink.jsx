import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, MessageCircle } from 'lucide-react';

export default function WhatsAppConnectLink({ children = 'Conectar WhatsApp', className = '', onOpen, iconOnly = false }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!opening) return;
    const reset = () => setOpening(false);
    const timer = window.setTimeout(reset, 2500);
    window.addEventListener('pageshow', reset);
    window.addEventListener('focus', reset);
    return () => { clearTimeout(timer); window.removeEventListener('pageshow', reset); window.removeEventListener('focus', reset); };
  }, [opening]);
  const connect = event => {
    if (opening) { event.preventDefault(); return; }
    try {
      // Refresh synchronously, then let the browser follow a real link once.
      event.currentTarget.href = base44.agents.getWhatsAppConnectURL('orion_asistente');
      event.currentTarget.target = window.matchMedia('(max-width: 1023px)').matches ? '_self' : '_blank';
      setError('');
      setOpening(true);
      onOpen?.();
    } catch {
      event.preventDefault();
      setOpening(false);
      setError('No se pudo abrir WhatsApp. Vuelve a intentarlo.');
    }
  };
  return <>
    <a href={base44.agents.getWhatsAppConnectURL('orion_asistente')} target="_self" rel="noopener noreferrer" onClick={connect} aria-label="Conectar WhatsApp con GO" aria-busy={opening} className={`inline-flex min-h-12 min-w-12 touch-manipulation items-center justify-center gap-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-80 ${className}`}>
      {opening ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" /> : <MessageCircle className="h-5 w-5 shrink-0" />}
      {!iconOnly && <span>{opening ? 'Abriendo WhatsApp…' : children}</span>}
    </a>
    {error && <span role="alert" className="block max-w-xs text-sm text-destructive">{error}</span>}
  </>;
}