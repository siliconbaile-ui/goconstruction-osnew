import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Plus, MessageSquare, Trash2, Loader2, Zap } from 'lucide-react';
import MessageBubble from './MessageBubble';

const AGENT_NAME = 'orion_asistente';

const SUGGESTIONS = [
  '¿Qué alertas activas tengo ahora?',
  'Resume las desviaciones de avance críticas',
  'Escala la alerta de la NC-0001 a gerencia media',
  '¿Qué EDPs están bloqueados y por qué?',
  'Cierra la RDI-0002 si está respondida',
];

export default function ConversationPanel() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const scrollRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(list || []);
      return list || [];
    } catch {
      setConversations([]);
      return [];
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const startNewConversation = useCallback(async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: `Sesión · ${new Date().toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` }
      });
      setConversations(prev => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages(conv.messages || []);
      return conv;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const list = await loadConversations();
      if (list.length > 0) {
        setActiveId(list[0].id);
      } else {
        const conv = await startNewConversation();
        if (conv) await loadConversations();
      }
      setLoading(false);
    })();
  }, [loadConversations, startNewConversation]);

  useEffect(() => {
    if (!activeId) return;
    let mounted = true;
    const fetchMessages = async () => {
      try {
        const conv = await base44.agents.getConversation(activeId);
        if (mounted) setMessages(conv.messages || []);
      } catch (e) { console.error(e); }
    };
    fetchMessages();
    const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
      if (mounted) setMessages(data.messages || []);
    });
    return () => { mounted = false; unsubscribe(); };
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !activeId || sending) return;
    setInput('');
    setSending(true);
    try {
      const conv = conversations.find(c => c.id === activeId) || await base44.agents.getConversation(activeId);
      await base44.agents.addMessage(conv, { role: 'user', content });
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await base44.agents.deleteConversation?.(id);
    } catch {}
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeId === id) {
      if (remaining.length > 0) setActiveId(remaining[0].id);
      else startNewConversation();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: '#4A6FA5' }} />
          <p className="font-mono text-xs" style={{ color: '#4A6FA5' }}>INICIANDO ORION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ background: '#070D1A' }}>
      {/* Conversations sidebar */}
      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col" style={{ background: '#040A15', borderRight: '1px solid #0F1D35' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #0F1D35' }}>
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#4A6FA5' }}>Sesiones</span>
          <button
            onClick={startNewConversation}
            className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white"
            title="Nueva conversación"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {loadingConvs ? (
            <div className="px-2 py-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin mx-auto" style={{ color: '#4A6FA5' }} />
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-2 py-4 text-xs text-center" style={{ color: '#2D4A6E' }}>Sin sesiones</p>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded cursor-pointer text-xs ${
                  activeId === c.id ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                style={activeId === c.id ? { background: 'rgba(0,51,153,0.2)', borderLeft: '2px solid #003399' } : {}}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <span className="truncate flex-1">{c.metadata?.name || 'Sin título'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-orange-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 lg:px-6 py-3 flex-shrink-0" style={{ background: '#040A15', borderBottom: '1px solid #0F1D35' }}>
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: '#003399' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">ORION · ASISTENTE</div>
            <div className="font-mono text-[10px]" style={{ color: '#4A6FA5' }}>CONVERSACIÓN · COMMAND CENTER</div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded font-mono text-[10px]" style={{ background: '#0A1628', border: '1px solid #0F1D35', color: '#27AE60' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#27AE60' }} />
            EN LÍNEA
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#003399' }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Hola, soy Orion</h2>
              <p className="text-sm mb-6" style={{ color: '#4A6FA5' }}>
                Monitoreo alertas, desviaciones, RDIs y pagos de tu obra. Pregúntame o pídeme una acción.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs px-3 py-2.5 rounded transition-colors"
                    style={{ background: '#0D1526', border: '1px solid #1E2D4A', color: '#CBD5E1' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map(m => <MessageBubble key={m.id || m.created_date} message={m} />)}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 lg:px-6 py-3" style={{ background: '#040A15', borderTop: '1px solid #0F1D35' }}>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Escribe a Orion... (Enter para enviar)"
              className="flex-1 resize-none px-3 py-2.5 rounded text-sm outline-none"
              style={{ background: '#0A1628', border: '1px solid #1E2D4A', color: '#E2E8F0', maxHeight: 120 }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="p-2.5 rounded disabled:opacity-40 flex-shrink-0"
              style={{ background: '#003399', color: 'white' }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}