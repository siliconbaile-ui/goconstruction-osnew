import { Link } from 'react-router-dom';
import { MessageSquare, Loader2, ArrowRight, Plus, X } from 'lucide-react';
import BotonKPI from './panel/BotonKPI';

const NIVEL_COLOR = {
  critica: 'hsl(var(--danger))',
  advertencia: 'hsl(var(--warn))',
  info: 'hsl(var(--info))',
};

// Cada KPI es un botón que le encarga a GO el análisis de ese frente.
const KPIS = [
  {
    label: 'alertas activas',
    valor: s => s.alertas,
    color: s => (s.alertas > 0 ? 'hsl(var(--danger))' : 'hsl(var(--ok))'),
    prompt: 'Dame las alertas activas priorizadas por criticidad y qué hago con cada una',
  },
  {
    label: 'partidas en rojo',
    valor: s => s.desviaciones,
    color: s => (s.desviaciones > 0 ? 'hsl(var(--warn))' : 'hsl(var(--ok))'),
    prompt: 'Dime las partidas con peor desviación, la causa raíz y el impacto en días',
  },
  {
    label: 'RDIs abiertos',
    valor: s => s.rdis,
    color: () => 'hsl(var(--foreground))',
    prompt: 'Estado de los RDIs abiertos: vencidos, sin especialista y qué destrabar primero',
  },
  {
    label: 'EDPs bloqueados',
    valor: s => s.pagos,
    color: s => (s.pagos > 0 ? 'hsl(var(--danger))' : 'hsl(var(--ok))'),
    prompt: 'Qué EDPs están bloqueados, por qué NC y cuánta plata está retenida',
  },
];

export default function ObraLivePanel({
  tab, setTab, stats, topAlerts, conversations, activeId, setActiveId,
  metas = {}, onPrompt, loadingConvs, onNueva, movil = false, onCerrar,
}) {
  return (
    <aside className={movil
      ? 'w-full h-full flex flex-col min-h-0 p-3'
      : 'w-72 xl:w-80 flex-shrink-0 hidden lg:flex flex-col min-h-0 p-3'}>
      <div className="flex flex-col min-h-0 flex-1 rounded-2xl overflow-hidden bg-surface border border-hairline">
        {/* Header compacto: una línea de estado + KPIs accionables */}
        <div className="px-3 pt-3 pb-3 flex-shrink-0 border-b border-hairline">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: 'hsl(var(--ok))' }} />
            <span className="text-[10px] font-mono tracking-widest text-primary truncate">TU OBRA · EN VIVO</span>
            {movil && (
              <button onClick={onCerrar} aria-label="Cerrar panel"
                className="ml-auto w-10 h-10 rounded-full flex items-center justify-center bg-surface-raised text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {KPIS.map(k => (
              <BotonKPI key={k.label} valor={k.valor(stats)} label={k.label}
                color={k.color(stats)} onClick={() => onPrompt(k.prompt)} />
            ))}
          </div>

          <div className="flex gap-1 mt-2.5 p-0.5 rounded-lg bg-surface-raised">
            {[
              { key: 'alertas', label: 'Alertas' },
              { key: 'acciones', label: 'Acciones' },
              { key: 'sesiones', label: 'Sesiones' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div data-scroll-area className="flex-1 overflow-y-auto min-h-0 p-2.5 space-y-2">
          {tab === 'alertas' && (
            topAlerts.length === 0 ? (
              <p className="text-xs text-center py-6 text-muted-foreground">Sin alertas activas. Operación normal.</p>
            ) : topAlerts.map(a => (
              <button key={a.id} onClick={() => onPrompt(`Revisa la alerta "${a.titulo}" y dime qué debo hacer`)}
                className="w-full text-left rounded-lg px-3 py-2.5 border border-hairline transition-colors hover:border-primary/40 active:opacity-80">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: NIVEL_COLOR[a.nivel] || 'hsl(var(--info))' }} />
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: NIVEL_COLOR[a.nivel] || 'hsl(var(--muted-foreground))' }}>
                    {a.tipo?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-sm font-medium leading-snug text-foreground">{a.titulo}</div>
                {a.mensaje && <div className="text-xs mt-1 line-clamp-2 text-muted-foreground">{a.mensaje}</div>}
              </button>
            ))
          )}

          {tab === 'acciones' && [
            'Escala todas las alertas con más de 24h sin respuesta',
            'Cierra las RDIs respondidas pendientes',
            'Desbloquea EDPs sin NC críticas',
            'Genera un resumen ejecutivo de la obra',
            'Dime las 3 partidas con peor desviación y qué hacer',
          ].map(a => (
            <button key={a} onClick={() => onPrompt(a)}
              className="w-full text-left rounded-lg px-3 py-2.5 min-h-11 text-xs font-medium border border-hairline text-foreground/85 transition-colors hover:border-primary/40 active:opacity-80 flex items-center gap-2">
              <span className="flex-1">{a}</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            </button>
          ))}

          {tab === 'sesiones' && (
            <>
              <button onClick={onNueva}
                className="w-full flex items-center gap-2 rounded-xl p-3 text-xs font-medium border border-dashed border-hairline text-primary transition-colors hover:bg-surface-raised">
                <Plus className="w-3.5 h-3.5" /> Nueva conversación
              </button>
              {loadingConvs ? (
                <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div>
              ) : conversations.map(c => {
                const meta = metas[c.id];
                return (
                  <div key={c.id} onClick={() => setActiveId(c.id)}
                    className={`flex flex-col gap-1.5 rounded-xl px-3 py-3 cursor-pointer text-sm border transition-colors ${
                      activeId === c.id
                        ? 'bg-surface-raised border-primary/40 text-foreground'
                        : 'border-hairline text-muted-foreground'}`}>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate flex-1">{meta?.titulo || c.metadata?.name || 'Sesión sin clasificar'}</span>
                    </div>
                    {(meta?.categoria || meta?.etiquetas?.length > 0) && (
                      <div className="flex flex-wrap gap-1 pl-5">
                        {meta?.categoria && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-primary/15 text-primary">
                            {meta.categoria}
                          </span>
                        )}
                        {(meta?.etiquetas || []).slice(0, 3).map(e => (
                          <span key={e} className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-surface-raised text-primary">
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                    {meta?.resumen && (
                      <p className="pl-5 text-[11px] leading-snug line-clamp-2 text-muted-foreground">{meta.resumen}</p>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* CTA */}
        <div className="p-2.5 flex-shrink-0 border-t border-hairline">
          <Link to="/informe-ejecutivo"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-semibold tracking-wide bg-primary text-primary-foreground">
            VER INFORME EJECUTIVO <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}