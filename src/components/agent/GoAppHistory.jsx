import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const agents = ['orion_asistente', 'go_incorporacion', 'go_vendedor'];
function visible(message) {
  const text = message.content || '';
  if (message.role !== 'user') return text;
  for (const marker of ['[GO_APP_USER_MESSAGE]\n', '\n[CONSULTA]\n']) {
    if (text.includes(marker)) return text.split(marker).slice(1).join(marker);
  }
  return text;
}

export default function GoAppHistory() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all(agents.map(agent_name => base44.agents.listConversations({ agent_name })))
      .then(groups => setSessions(groups.flat().filter(c => c.metadata?.canal === 'app' || c.metadata?.go_context)
        .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))))
      .catch(() => setError('No se pudieron cargar las sesiones de la app.'))
      .finally(() => setLoading(false));
  }, []);
  const open = async c => {
    setSelected(c.id); setMessages([]); setError('');
    try { const full = await base44.agents.getConversation(c.id); setMessages(full.messages || []); }
    catch { setError('No se pudo abrir esta sesión.'); }
  };
  return <section className="space-y-3 border-t border-hairline pt-4">
    <h3 className="text-sm font-semibold text-foreground">Conversaciones de la app</h3>
    {loading && <p className="text-xs text-muted-foreground">Cargando sesiones…</p>}
    {!loading && !sessions.length && !error && <p className="text-xs text-muted-foreground">Todavía no hay conversaciones en la app.</p>}
    <div className="flex gap-2 overflow-x-auto pb-2">{sessions.map(c => <button key={c.id} onClick={() => open(c)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs ${selected === c.id ? 'border-primary text-primary' : 'border-hairline text-muted-foreground'}`}>{c.metadata?.name || 'Sesión GO'} · {new Date(c.created_date).toLocaleDateString('es-CL')}</button>)}</div>
    {selected && <div className="max-h-72 space-y-2 overflow-y-auto">{messages.filter(m => ['user', 'assistant'].includes(m.role) && m.content).map((m, i) => <p key={m.id || i} className="whitespace-pre-wrap break-words rounded-lg bg-surface p-3 text-xs text-foreground"><strong>{m.role === 'user' ? 'Tú' : 'GO'}:</strong> {visible(m)}</p>)}</div>}
    {error && <p role="alert" className="text-xs text-danger">{error}</p>}
  </section>;
}