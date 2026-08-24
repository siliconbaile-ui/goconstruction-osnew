import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Sparkles, Activity } from 'lucide-react';
import MessageBubble from './MessageBubble';
import AgentSidebar from './AgentSidebar';
import ObraLivePanel from './ObraLivePanel';
import ChatComposer from './ChatComposer';
import WelcomeHero from './WelcomeHero';
import { WhatsAppButton } from './WhatsAppConnect';
import useVoiceOutput, { desbloquearVoz } from '@/hooks/useVoiceOutput';
import useHistorialClasificado from '@/hooks/useHistorialClasificado';
import agruparMensajes from '@/lib/agruparMensajes';

const AGENT_NAME = 'orion_asistente';

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
  const [proyecto, setProyecto] = useState(null);
  const [topAlerts, setTopAlerts] = useState([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [panelMovil, setPanelMovil] = useState(false);
  const scrollRef = useRef(null);

  const { hablando, detener: detenerVoz } = useVoiceOutput(messages, voiceMode);
  const metas = useHistorialClasificado(conversations, activeId, messages);

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
    (async () => {
      try {
        const conv = await base44.agents.getConversation(activeId);
        if (mounted) setMessages(conv.messages || []);
      } catch (e) { console.error(e); }
    })();
    const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
      if (mounted && Array.isArray(data?.messages) && data.messages.length > 0) setMessages(data.messages);
    });
    return () => { mounted = false; unsubscribe(); };
  }, [activeId]);

  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const [alerts, partidas, rdis, edps, pvs] = await Promise.all([
          base44.entities.AlertaSistema.filter({ estado: 'activa' }, '-created_date', 20),
          base44.entities.PartidaControl.list('-updated_date', 100),
          base44.entities.RequerimientoInformacion.filter({ estado: { $in: ['abierto', 'en_revision', 'vencido'] } }, '-created_date', 100),
          base44.entities.EstadoPago.filter({ estado: { $in: ['bloqueado_calidad', 'pendiente_firma'] } }, '-created_date', 100),
          base44.entities.ProyectoObra.list('-created_date', 1),
        ]);
        const desviaciones = partidas.filter(p => {
          const d = p.avance_programado ? ((p.avance_programado - p.avance_real) / p.avance_programado) * 100 : 0;
          return d > 5;
        }).length;
        setStats({ alertas: alerts.length, desviaciones, rdis: rdis.length, pagos: edps.length });
        setTopAlerts(alerts.slice(0, 5));
        setProyecto(pvs[0] || null);
      } catch (e) { console.error(e); }
    })();
  }, [messages]);

  const send = async (text, fileUrls = []) => {
    const content = (text ?? input).trim();
    if ((!content && fileUrls.length === 0) || !activeId || sending) return;
    setInput('');
    setSending(true);
    setErrorEnvio(null);
    const msg = { role: 'user', content: content || 'Analiza los documentos adjuntos, extrae los datos relevantes y crúzalos con la información de la obra.' };
    if (fileUrls.length > 0) msg.file_urls = fileUrls;
    try {
      const conv = await base44.agents.getConversation(activeId);
      await base44.agents.addMessage(conv, msg);
    } catch (e) {
      console.error(e);
      setInput(content);
      setErrorEnvio(msg);
    } finally {
      setSending(false);
    }
  };

  const reintentar = () => {
    if (!errorEnvio) return;
    const { content, file_urls } = errorEnvio;
    setErrorEnvio(null);
    send(content, file_urls || []);
  };

  const ficha = {
    completos: [proyecto?.nombre, proyecto?.mandante, stats.alertas >= 0, proyecto?.ultima_sincronizacion].filter(Boolean).length,
    filas: [
      { label: 'OBRA', valor: proyecto?.nombre || 'por conversar' },
      { label: 'MANDANTE', valor: proyecto?.mandante || 'por conversar' },
      { label: 'VIGILANCIA', valor: '24/7 · escalamiento auto' },
      {
        label: 'RIESGO ACTUAL',
        valor: stats.alertas > 0 ? `${stats.alertas} alerta(s) activa(s)` : 'sin alertas',
        alerta: stats.alertas > 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-base">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
          <p className="font-mono text-xs text-muted-foreground">INICIANDO GO...</p>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-surface-base text-foreground">
      <AgentSidebar onPrompt={send} ficha={ficha} />

      {/* CENTRO */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 p-0 sm:p-4 lg:pr-0">
        <div className="flex flex-col min-h-0 flex-1 rounded-none sm:rounded-2xl overflow-hidden bg-surface-base border-0 sm:border border-hairline">
          {/* Header agente */}
          <header className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 lg:px-8 py-2.5 sm:py-4 flex-shrink-0 border-b border-hairline bg-surface">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate text-foreground">
GO<span className="hidden sm:inline"> · jefe técnico de obra</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest" style={{ color: 'hsl(var(--ok))' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(var(--ok))' }} />
                <span className="whitespace-nowrap">EN VIVO<span className="hidden sm:inline"> · VIGILANDO</span></span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
              <span className="hidden md:inline text-[11px] text-muted-foreground">
criterio técnico con los datos reales de tu obra
              </span>
              <WhatsAppButton />
              <button onClick={() => setPanelMovil(true)}
                className="lg:hidden flex items-center gap-1.5 h-9 px-3 rounded-full text-[11px] font-semibold tracking-wide flex-shrink-0 bg-surface-raised text-foreground/85 active:scale-95 transition-transform">
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">OBRA</span>
              </button>
              <button onClick={startNewConversation}
                className="flex items-center gap-1.5 h-9 px-3 rounded-full text-[11px] font-semibold tracking-wide flex-shrink-0 bg-surface-raised text-primary active:scale-95 transition-transform">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">NUEVA SESIÓN</span>
              </button>
            </div>
          </header>

          {/* Mensajes */}
          <div ref={scrollRef} data-scroll-area
            className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 lg:px-8 py-4 sm:py-6 scroll-smooth">
            {!hasMessages ? (
              <WelcomeHero onPrompt={send} activo={sending} />
            ) : (
              <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
                {agruparMensajes(messages).map(m => (
                  <MessageBubble key={m.id || m.created_date} message={m} conversacionId={activeId} />
                ))}
                {sending && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    GO está operando...
                  </div>
                )}
              </div>
            )}
          </div>

          {errorEnvio && (
            <div className="flex-shrink-0 px-3 sm:px-4 lg:px-8 pb-1">
              <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs border"
                style={{ borderColor: 'hsl(var(--danger) / 0.4)', background: 'hsl(var(--danger) / 0.08)', color: 'hsl(var(--danger))' }}>
                <span className="flex-1">No se pudo enviar el mensaje (problema de red). Revisa tu conexión.</span>
                <button onClick={reintentar} className="px-3 py-1.5 rounded-full font-semibold text-primary-foreground bg-primary flex-shrink-0">
                  Reintentar
                </button>
              </div>
            </div>
          )}

          <ChatComposer
            value={input}
            onChange={setInput}
            onSend={(fileUrls) => send(undefined, fileUrls)}
            sending={sending}
            onVoice={(texto) => { desbloquearVoz(); setVoiceMode(true); send(texto); }}
            voiceMode={voiceMode}
            setVoiceMode={(v) => { if (v) desbloquearVoz(); else detenerVoz(); setVoiceMode(v); }}
            hablando={hablando}
          />
        </div>
      </div>

      {panelMovil && (
        <div className="fixed inset-0 z-50 lg:hidden bg-surface-base">
          <ObraLivePanel
            movil
            onCerrar={() => setPanelMovil(false)}
            tab={rightTab}
            setTab={setRightTab}
            stats={stats}
            topAlerts={topAlerts}
            conversations={conversations}
            activeId={activeId}
            setActiveId={(id) => { setActiveId(id); setPanelMovil(false); }}
            metas={metas}
            onPrompt={(p) => { setPanelMovil(false); send(p); }}
            loadingConvs={loadingConvs}
            onNueva={() => { setPanelMovil(false); startNewConversation(); }}
          />
        </div>
      )}

      <ObraLivePanel
        tab={rightTab}
        setTab={setRightTab}
        stats={stats}
        topAlerts={topAlerts}
        conversations={conversations}
        activeId={activeId}
        setActiveId={setActiveId}
        metas={metas}
        onPrompt={send}
        loadingConvs={loadingConvs}
        onNueva={startNewConversation}
      />
    </div>
  );
}