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

// Chat efímero de visitante: sin login y sin persistencia entre visitas.
// Con `contexto`, GO se abre ya situado en un escenario de obra concreto: el
// briefing se envía como primer mensaje y se oculta, así el visitante ve
// directamente a GO hablando del caso.
export default function ChatVisitante({ sugerencias, saludo, contexto, alEvento }) {
  const chips = sugerencias?.length ? sugerencias : SUGERENCIAS;
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [preparando, setPreparando] = useState(Boolean(contexto));
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const enviadosRef = useRef(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let unsub;
    (async () => {
      // Un reintento silencioso: la creación de conversación falla de forma
      // intermitente y el visitante no debe ver un panel muerto por eso.
      for (let i = 0; i < 2; i++) {
        try {
          const c = await base44.agents.createConversation({ agent_name: AGENT_NAME });
          if (!mounted) return;
          setConv(c);
          setError(false);
          unsub = base44.agents.subscribeToConversation(c.id, (data) => {
            if (mounted && Array.isArray(data?.messages)) {
              setMessages(data.messages);
              if (data.messages.some(m => m.role === 'assistant')) setPreparando(false);
            }
          });
          if (contexto) {
            const fresh = await base44.agents.getConversation(c.id);
            await base44.agents.addMessage(fresh, { role: 'user', content: contexto });
          }
          return;
        } catch {
          if (!mounted) return;
          if (i === 0) await new Promise(r => setTimeout(r, 1200));
        }
      }
      if (mounted) { setError(true); setPreparando(false); }
    })();
    return () => { mounted = false; if (unsub) unsub(); };
  }, [contexto, intento]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (texto) => {
    const content = (texto ?? input).trim();
    if (!content || !conv || sending) return;
    setInput('');
    setSending(true);
    enviadosRef.current += 1;
    if (alEvento) {
      if (enviadosRef.current === 1) alEvento('conversacion_iniciada');
      if (enviadosRef.current === 4) alEvento('interaccion_profunda');
    }
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
      <div className="orion-panel orion-elevated flex flex-col items-center justify-center gap-3 text-center px-6"
        style={{ height: 'min(64vh, 560px)' }}>
        <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-raised border border-hairline">
          <Sparkles className="w-4 h-4 text-primary" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm">
          No pude iniciar la conversación. Vuelve a intentarlo o entra directo a la demo con la obra cargada.
        </p>
        <button onClick={() => { setError(false); setPreparando(Boolean(contexto)); setIntento(n => n + 1); }}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground">
          Reintentar
        </button>
      </div>
    );
  }

  // El briefing del escenario no se muestra: es contexto, no conversación.
  const visibles = contexto ? messages.slice(1) : messages;

  return (
    <div className="orion-panel orion-elevated flex flex-col overflow-hidden" style={{ height: 'min(64vh, 560px)' }}>
      <div ref={scrollRef} data-scroll-area className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
        {visibles.length === 0 ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {saludo || 'Soy GO. Te explico cómo funciona o puedes ver un demo con una obra real cargada. ¿Qué prefieres?'}
              </p>
            </div>
            {preparando && (
              <div className="flex items-center gap-2 pl-8 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> GO está cargando el escenario de obra...
              </div>
            )}
            {!preparando && (
              <div className="flex flex-wrap gap-2 pl-8">
                {chips.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-full text-[11px] border border-hairline bg-surface-raised text-foreground/80 hover:border-primary/40">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {visibles.map((m, i) => (
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
            {enviadosRef.current === 0 && (
              <div className="flex flex-wrap gap-2">
                {chips.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-full text-[11px] border border-hairline bg-surface-raised text-foreground/80 hover:border-primary/40">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
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
          placeholder="Pregúntale a GO sobre este caso..."
          className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-surface-raised border border-hairline text-foreground" />
        <button type="submit" disabled={!input.trim() || sending || !conv}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-40">
          <ArrowUp className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}