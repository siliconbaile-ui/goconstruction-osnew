import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, Loader2, ArrowRight, Plus, X } from 'lucide-react';

const NIVEL_COLOR = {
  critica: 'hsl(var(--danger))',
  advertencia: 'hsl(var(--warn))',
  info: 'hsl(var(--info))',
};

export default function ObraLivePanel({
  tab, setTab, stats, topAlerts, conversations, activeId, setActiveId,
  onDelete, onPrompt, loadingConvs, onNueva, movil = false, onCerrar,
}) {
  return (
    <aside className={movil
      ? 'w-full h-full flex flex-col min-h-0 p-3'
      : 'w-80 flex-shrink-0 hidden lg:flex flex-col min-h-0 p-4'}>
      <div className="flex flex-col min-h-0 flex-1 rounded-2xl overflow-hidden bg-surface border border-hairline">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0 border-b border-hairline">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono tracking-widest mb-1 text-primary">TU OBRA, EN VIVO</div>
              <div className="text-lg font-semibold leading-tight text-foreground">Así se ve tu obra ahora</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-primary text-primary-foreground">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(var(--ok))' }} />
                EN VIVO
              </span>
              {movil && (
                <button onClick={onCerrar} aria-label="Cerrar panel"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-raised text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] mt-2 leading-relaxed text-muted-foreground">
            Toca cualquier dato o pregúntale a Orion: este panel es tu obra.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { l: 'alertas activas', v: stats.alertas, c: stats.alertas > 0 ? 'hsl(var(--danger))' : 'hsl(var(--ok))' },
              { l: 'partidas en rojo', v: stats.desviaciones, c: stats.desviaciones > 0 ? 'hsl(var(--warn))' : 'hsl(var(--ok))' },
              { l: 'RDIs abiertos', v: stats.rdis, c: 'hsl(var(--foreground))' },
              { l: 'EDPs bloqueados', v: stats.pagos, c: stats.pagos > 0 ? 'hsl(var(--danger))' : 'hsl(var(--ok))' },
            ].map(k => (
              <div key={k.l} className="rounded-xl px-4 py-3.5 bg-surface-raised">
                <div className="text-2xl sm:text-xl font-semibold leading-none" style={{ color: k.c }}>{k.v}</div>
                <div className="text-[11px] mt-1.5 text-muted-foreground">{k.l}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5 mt-4">
            {[
              { key: 'alertas', label: 'Alertas' },
              { key: 'acciones', label: 'Acciones' },
              { key: 'sesiones', label: 'Sesiones' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 sm:flex-none min-h-10 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                  tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-surface-raised text-muted-foreground'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2.5">
          {tab === 'alertas' && (
            topAlerts.length === 0 ? (
              <p className="text-xs text-center py-6 text-muted-foreground">Sin alertas activas. Operación normal.</p>
            ) : topAlerts.map(a => (
              <button key={a.id} onClick={() => onPrompt(`Revisa la alerta "${a.titulo}" y dime qué debo hacer`)}
                className="w-full text-left rounded-xl p-4 border border-hairline transition-colors hover:border-primary/40 active:opacity-80">
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
              className="w-full text-left rounded-xl p-4 min-h-12 text-sm font-medium border border-hairline text-foreground/85 transition-colors hover:border-primary/40 active:opacity-80 flex items-center gap-2">
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
              ) : conversations.map(c => (
                <div key={c.id} onClick={() => setActiveId(c.id)}
                  className={`group flex items-center gap-2 rounded-xl px-3 py-3.5 min-h-12 cursor-pointer text-sm border transition-colors ${
                    activeId === c.id
                      ? 'bg-surface-raised border-primary/40 text-foreground'
                      : 'border-hairline text-muted-foreground'}`}>
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{c.metadata?.name || 'Sin título'}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    className="p-2 -m-1 rounded-full text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CTA */}
        <div className="p-4 flex-shrink-0 border-t border-hairline">
          <Link to="/informe-ejecutivo"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold tracking-wide bg-primary text-primary-foreground">
            VER INFORME EJECUTIVO <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}