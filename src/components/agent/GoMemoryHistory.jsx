import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function GoMemoryHistory() {
  const [turns, setTurns] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const load = async next => {
    setLoading(true); setError('');
    try {
      const { data } = await base44.functions.invoke('memoriaGo', { accion: 'historial', ...(next ? { cursor: next } : {}) });
      setTurns(prev => next ? [...prev, ...data.turnos] : data.turnos);
      setCursor(data.siguiente);
    } catch { setError('No se pudo cargar el historial de WhatsApp.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(null); }, []);
  return <section className="space-y-3">
    <h3 className="text-sm font-semibold text-foreground">Conversaciones de WhatsApp</h3>
    {!loading && !turns.length && !error && <p className="text-xs text-muted-foreground">Aún no hay mensajes guardados de este número.</p>}
    {turns.map(t => <article key={t.id} className="rounded-xl border border-hairline bg-surface p-3 space-y-2">
      <time className="block text-[10px] text-muted-foreground">{new Date(t.fecha).toLocaleString('es-CL')}</time>
      <p className="text-xs whitespace-pre-wrap break-words text-foreground"><strong>Tú:</strong> {t.entrada}</p>
      {t.salida ? <p className="text-xs whitespace-pre-wrap break-words text-foreground"><strong>GO:</strong> {t.salida}</p> : <p className="text-xs text-muted-foreground">{t.estado === 'error' ? 'Respuesta no entregada.' : 'Respuesta pendiente.'}</p>}
    </article>)}
    {cursor && <button onClick={() => load(cursor)} disabled={loading} className="rounded-lg border border-hairline px-3 py-2 text-xs text-foreground disabled:opacity-50">Cargar mensajes anteriores</button>}
    {loading && <p className="text-xs text-muted-foreground">Cargando historial…</p>}
    {error && <p role="alert" className="text-xs text-danger">{error}</p>}
  </section>;
}