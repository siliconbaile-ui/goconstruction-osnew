import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowUp, Sparkles } from 'lucide-react';
import MarkdownContent from '@/components/agent/MarkdownContent';

const AGENT_NAME = 'go_vendedor';

const SUGERENCIAS = [
  '¿Qué hace exactamente la plataforma?',
  '¿Cómo bloquean un pago por calidad?',
  '¿Qué hago con una foto por WhatsApp?',
];

// Chat efímero de visitante: sin login, sin datos de obra, sin persistencia entre visitas.
export default function ChatVisitante({ sugerencias, saludo }) {
  const chips = sugerencias?.length ? sugerencias : SUGERENCIAS;
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await base44.agents.createConversation({ agent_name: AGENT_NAME });
        if (!mounted) return;
        setConv(c);
        const unsub = base44.agents.subscribeToConversation(c.id, (data) => {
          if (mounted && Array.isArray(data?.messages)) setMessages(data.messages);
        });
        return unsub;
      } catch {
        if (mounted) setError(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (texto) => {
    const content = (texto ?? input).trim();
    if (!content || !conv || sending) return;
    setInput('');
    setSending(true);
    try {
      const fresh = await base44.agents.getConversation(conv.id);
      await base44.agents.addMessage(fresh, { role: 'user', content });
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div className="orion-panel p-5 text-sm text-muted-foreground">
        El chat de demostración no está disponible en este momento. Puedes ver el demo o registrarte con los botones de arriba.
      </div>
    );
  }

  return (
    <div className="orion-panel orion-elevated flex flex-col overflow-hidden" style={{ height: 'min(60vh, 520px)' }}>
      <div ref={scrollRef} data-scroll-area className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {saludo || 'Soy GO. Te explico cómo funciona o puedes ver un demo con una obra real cargada. ¿Qué prefieres?'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pl-8">
              {chips.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-full text-[11px] border border-hairline bg-surface-raised text-foreground/80 hover:border-primary/40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : messages.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3.5 py-2.5 rounded-2xl max-w-[88%] ${m.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-surface-raised border border-hairline text-foreground rounded-tl-sm'}`}>
              {m.role === 'user'
                ? <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                : <MarkdownContent content={m.content || ''} />}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> GO está respondiendo...
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex-shrink-0 flex items-center gap-2 p-3 border-t border-hairline">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale a GO sobre la plataforma..."
          className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-surface-raised border border-hairline text-foreground" />
        <button type="submit" disabled={!input.trim() || sending || !conv}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-40">
          <ArrowUp className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}