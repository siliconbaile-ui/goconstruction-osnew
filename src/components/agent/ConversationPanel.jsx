import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Send, Plus, MessageSquare, Trash2, Loader2, Zap, Sparkles, Mic, Volume2,
  Bell, TrendingUp, FileText, CreditCard, CheckSquare, AlertTriangle,
  ChevronLeft, Activity, ShoppingCart, User, ClipboardList, Home
} from 'lucide-react';
import MessageBubble from './MessageBubble';

const AGENT_NAME = 'orion_asistente';

const STAGES = ['OBSERVA', 'APRENDE', 'ACTÚA', 'VERIFICA', 'MEJORA'];

const NAV_CATEGORIES = [
  { label: 'Alertas', icon: Bell, prompt: 'Muéstrame las alertas activas ordenadas por criticidad' },
  { label: 'Desviaciones', icon: TrendingUp, prompt: 'Resume las desviaciones de avance críticas' },
  { label: 'RDIs', icon: FileText, prompt: 'Lista los RDIs abiertos y vencidos' },
  { label: 'Inspecciones', icon: CheckSquare, prompt: 'Muéstrame las inspecciones y NCs abiertas' },
  { label: 'Pagos', icon: CreditCard, prompt: '¿Qué EDPs están bloqueados y por qué?' },
  { label: 'Partidas', icon: Activity, prompt: 'Muéstrame el avance de las partidas con semáforo' },
];

const ACTION_TILES = [
  { label: 'Ver alertas', sub: 'activas ahora', icon: AlertTriangle, prompt: '¿Qué alertas activas tengo ahora?' },
  { label: 'Resumir avance', sub: 'desviaciones clave', icon: TrendingUp, prompt: 'Resume las desviaciones de avance críticas' },
  { label: 'Gestionar RDIs', sub: 'abiertos y vencidos', icon: FileText, prompt: 'Lista los RDIs abiertos y vencidos' },
  { label: 'Revisar pagos', sub: 'EDPs bloqueados', icon: CreditCard, prompt: '¿Qué EDPs están bloqueados y por qué?' },
];

export default function ConversationPanel() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [rightTab, setRightTab] = useState('alertas');
  const [stats, setStats] = useState({ alertas: 0, desviaciones: 0, rdis: 0, pagos: 0 });
  const [topAlerts, setTopAlerts] = useState([]);
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Load operational stats + top alerts for sidebars
  useEffect(() => {
    (async () => {
      try {
        const [alerts, partidas, rdis, edps] = await Promise.all([
          base44.entities.AlertaSistema.filter({ estado: 'activa' }, '-created_date', 20),
          base44.entities.PartidaControl.list('-updated_date', 50),
          base44.entities.RequerimientoInformacion.filter({ estado: { $in: ['abierto', 'en_revision', 'vencido'] } }, '-created_date', 50),
          base44.entities.EstadoPago.filter({ estado: { $in: ['bloqueado_calidad', 'pendiente_firma'] } }, '-created_date', 50),
        ]);
        const desviaciones = partidas.filter(p => {
          const d = p.avance_programado ? ((p.avance_programado - p.avance_real) / p.avance_programado) * 100 : 0;
          return d > 5;
        }).length;
        setStats({
          alertas: alerts.length,
          desviaciones,
          rdis: rdis.length,
          pagos: edps.length,
        });
        setTopAlerts(alerts.slice(0, 4));
      } catch (e) { console.error(e); }
    })();
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
    try { await base44.agents.deleteConversation?.(id); } catch {}
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeId === id) {
      if (remaining.length > 0) setActiveId(remaining[0].id);
      else startNewConversation();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#F9F9F9' }}>
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: '#003399' }} />
          <p className="font-mono text-xs" style={{ color: '#666' }}>INICIANDO ORION...</p>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;
  const progressFill = sending ? 80 : 0;

  return (
    <div className="flex h-full" style={{ background: '#F9F9F9', color: '#212121' }}>
      {/* LEFT SIDEBAR — NAVEGAR */}
      <aside className="w-60 flex-shrink-0 hidden lg:flex flex-col" style={{ background: '#FFFFFF', borderRight: '1px solid #EDEDED' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EDEDED' }}>
          <span className="text-xs font-semibold tracking-widest" style={{ color: '#212121' }}>NAVEGAR</span>
          <ChevronLeft className="w-4 h-4" style={{ color: '#999' }} />
        </div>
        <div className="px-5 pt-4 pb-2">
          <span className="text-[10px] font-semibold tracking-widest" style={{ color: '#999' }}>CATEGORÍAS</span>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_CATEGORIES.map(({ label, icon: Icon, prompt }, idx) => (
            <button
              key={label}
              onClick={() => send(prompt)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                idx === 0 ? 'font-medium' : 'hover:bg-gray-50'
              }`}
              style={idx === 0
                ? { background: 'transparent', border: '1px solid #E0E0E0', color: '#212121' }
                : { color: '#555' }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: idx === 0 ? '#003399' : '#999' }} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="m-4 p-4 rounded-xl" style={{ background: '#F4F6FB', border: '1px solid #E8ECF4' }}>
          <p className="text-[11px] leading-relaxed" style={{ color: '#555' }}>
            <span className="font-semibold" style={{ color: '#003399' }}>Orion</span> monitorea tu obra 24/7 y escala alertas automáticamente.
          </p>
        </div>
      </aside>

      {/* CENTER — ASSISTANT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top context bar */}
        <header className="flex items-center gap-3 px-5 lg:px-8 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #EDEDED', background: '#FFFFFF' }}>
          <Home className="w-4 h-4" style={{ color: '#999' }} />
          <ChevronLeft className="w-4 h-4" style={{ color: '#999' }} />
          <span className="text-sm font-medium" style={{ color: '#212121' }}>ORION</span>
          <div className="ml-auto flex items-center gap-4">
            <button onClick={startNewConversation} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#555' }}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CONVERSACIÓN</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: '#003399', color: 'white' }}>
              <span>OBRA PILOTO</span>
            </div>
          </div>
        </header>

        {/* Messages or Welcome */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 lg:px-8 py-6">
          {!hasMessages ? (
            <div className="max-w-3xl mx-auto">
              {/* Identity */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#003399' }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-base" style={{ color: '#212121' }}>Asistente Orion</div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#27AE60' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#27AE60' }} />
                    EN LÍNEA
                  </div>
                </div>
              </div>

              {/* Progress loop */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  {STAGES.map((s, i) => (
                    <span key={s} className="text-[10px] font-semibold tracking-widest" style={{ color: sending && i <= 2 ? '#003399' : '#BBB' }}>{s}</span>
                  ))}
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: '#EEE' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressFill}%`, background: '#003399' }} />
                </div>
              </div>

              {/* Prompt */}
              <h1 className="text-2xl lg:text-3xl font-semibold mb-2" style={{ color: '#212121' }}>¿Qué necesitas hoy?</h1>
              <p className="text-sm mb-6" style={{ color: '#666' }}>
                Dime en tus palabras qué necesitas y armo las opciones — para tu obra o tu partida.
              </p>

              {/* Action tiles 2x2 */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {ACTION_TILES.map(({ label, sub, icon: Icon, prompt }) => (
                  <button
                    key={label}
                    onClick={() => send(prompt)}
                    className="text-left p-4 rounded-xl transition-all hover:shadow-sm"
                    style={{ background: '#FFFFFF', border: '1px solid #EDEDED' }}
                  >
                    <Icon className="w-5 h-5 mb-3" style={{ color: '#003399' }} />
                    <div className="font-semibold text-sm" style={{ color: '#212121' }}>{label}</div>
                    <div className="text-xs" style={{ color: '#999' }}>{sub}</div>
                  </button>
                ))}
              </div>

              {/* Insights */}
              <div className="p-5 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #EDEDED' }}>
                <div className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: '#999' }}>LO QUE SÉ DE TU OBRA</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-semibold" style={{ color: '#212121' }}>{stats.alertas}</div>
                    <div className="text-xs" style={{ color: '#888' }}>alertas activas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold" style={{ color: '#212121' }}>{stats.desviaciones}</div>
                    <div className="text-xs" style={{ color: '#888' }}>partidas en rojo</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold" style={{ color: '#212121' }}>{stats.pagos}</div>
                    <div className="text-xs" style={{ color: '#888' }}>EDPs bloqueados</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map(m => <MessageBubble key={m.id || m.created_date} message={m} />)}
              {sending && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#999' }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#003399' }} />
                  Orion está pensando...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 px-5 lg:px-8 py-4" style={{ background: '#F9F9F9', borderTop: '1px solid #EDEDED' }}>
          <div className="max-w-3xl mx-auto flex items-center gap-2 p-2 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}>
            <Sparkles className="w-5 h-5 flex-shrink-0 ml-1" style={{ color: '#003399' }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ej: escala la alerta NC-0001 a gerencia media"
              className="flex-1 bg-transparent outline-none text-sm py-2"
              style={{ color: '#212121' }}
            />
            <button className="p-2 rounded-full hover:bg-gray-100" style={{ color: '#999' }} title="Voz">
              <Volume2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100" style={{ color: '#999' }} title="Micrófono">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-full disabled:opacity-40 flex-shrink-0"
              style={{ background: '#003399', color: 'white' }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="w-72 flex-shrink-0 hidden xl:flex flex-col" style={{ background: '#FFFFFF', borderLeft: '1px solid #EDEDED' }}>
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-3" style={{ borderBottom: '1px solid #EDEDED' }}>
          {[
            { key: 'alertas', label: 'Alertas', icon: Bell },
            { key: 'sesiones', label: 'Sesiones', icon: MessageSquare },
            { key: 'acciones', label: 'Acciones', icon: ClipboardList },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setRightTab(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={rightTab === key
                ? { background: '#003399', color: 'white' }
                : { color: '#888' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {rightTab === 'alertas' && (
            <>
              <div className="p-4 rounded-xl" style={{ background: '#F4F6FB', border: '1px solid #E8ECF4' }}>
                <div className="font-semibold text-sm mb-1" style={{ color: '#212121' }}>¿Listo para operar?</div>
                <p className="text-xs" style={{ color: '#666' }}>Empieza con estas alertas críticas curadas por Orion.</p>
              </div>
              <div className="text-[10px] font-semibold tracking-widest pt-1" style={{ color: '#999' }}>SUGERIDAS PARA TI</div>
              {topAlerts.length === 0 ? (
                <p className="text-xs" style={{ color: '#AAA' }}>Sin alertas activas. Todo en orden.</p>
              ) : topAlerts.map(a => (
                <button
                  key={a.id}
                  onClick={() => send(`Revisa la alerta "${a.titulo}" y dime qué debo hacer`)}
                  className="w-full text-left p-3 rounded-xl transition-colors hover:bg-gray-50"
                  style={{ background: '#FFFFFF', border: '1px solid #EDEDED' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: a.nivel === 'critica' ? '#D35400' : a.nivel === 'advertencia' ? '#F39C12' : '#4A6FA5' }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#999' }}>{a.tipo?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-xs font-medium leading-snug" style={{ color: '#212121' }}>{a.titulo}</div>
                  <div className="text-[11px] mt-1 line-clamp-2" style={{ color: '#888' }}>{a.mensaje}</div>
                </button>
              ))}
            </>
          )}

          {rightTab === 'sesiones' && (
            <>
              {loadingConvs ? (
                <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto" style={{ color: '#999' }} /></div>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#AAA' }}>Sin sesiones</p>
              ) : conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-xs ${activeId === c.id ? 'font-medium' : 'hover:bg-gray-50'}`}
                  style={activeId === c.id ? { background: '#F4F6FB', border: '1px solid #E8ECF4', color: '#212121' } : { color: '#666', border: '1px solid transparent' }}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#999' }} />
                  <span className="truncate flex-1">{c.metadata?.name || 'Sin título'}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }} className="opacity-0 group-hover:opacity-100" style={{ color: '#999' }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </>
          )}

          {rightTab === 'acciones' && (
            <>
              <div className="p-4 rounded-xl" style={{ background: '#F4F6FB', border: '1px solid #E8ECF4' }}>
                <div className="font-semibold text-sm mb-1" style={{ color: '#212121' }}>Acciones rápidas</div>
                <p className="text-xs" style={{ color: '#666' }}>Pídele a Orion que ejecute estas tareas.</p>
              </div>
              {[
                'Escala todas las alertas con >24h sin respuesta',
                'Cierra las RDIs respondidas pendientes',
                'Desbloquea EDPs sin NCs críticas',
                'Genera un resumen ejecutivo de la obra',
              ].map(a => (
                <button
                  key={a}
                  onClick={() => send(a)}
                  className="w-full text-left p-3 rounded-xl text-xs font-medium transition-colors hover:bg-gray-50"
                  style={{ background: '#FFFFFF', border: '1px solid #EDEDED', color: '#212121' }}
                >
                  {a}
                </button>
              ))}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}