import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, Loader2, ArrowRight, Plus } from 'lucide-react';

const NIVEL_DOT = { critica: '#D35400', advertencia: '#F39C12', info: '#4A6FA5' };

export default function ObraLivePanel({
  tab, setTab, stats, topAlerts, conversations, activeId, setActiveId,
  onDelete, onPrompt, loadingConvs, onNueva,
}) {
  return (
    <aside className="w-80 flex-shrink-0 hidden lg:flex flex-col min-h-0 p-4">
      <div className="flex flex-col min-h-0 flex-1 rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid #F0EEEA' }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#003399' }}>TU OBRA, EN VIVO</div>
              <div className="text-lg font-semibold leading-tight" style={{ color: '#141821' }}>Así se ve tu obra ahora</div>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono flex-shrink-0" style={{ background: '#0A1E4D', color: 'white' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#27AE60' }} />
              EN VIVO
            </span>
          </div>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#8A94A6' }}>
            Toca cualquier dato o pregúntale a Orion: este panel es tu obra.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { l: 'alertas activas', v: stats.alertas, c: stats.alertas > 0 ? '#D35400' : '#27AE60' },
              { l: 'partidas en rojo', v: stats.desviaciones, c: stats.desviaciones > 0 ? '#F39C12' : '#27AE60' },
              { l: 'RDIs abiertos', v: stats.rdis, c: '#141821' },
              { l: 'EDPs bloqueados', v: stats.pagos, c: stats.pagos > 0 ? '#D35400' : '#27AE60' },
            ].map(k => (
              <div key={k.l} className="rounded-xl px-3 py-2.5" style={{ background: '#F8F7F5' }}>
                <div className="text-xl font-semibold leading-none" style={{ color: k.c }}>{k.v}</div>
                <div className="text-[10px] mt-1" style={{ color: '#8A94A6' }}>{k.l}</div>
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
                className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors"
                style={tab === t.key
                  ? { background: '#0A1E4D', color: 'white' }
                  : { background: '#F1F0ED', color: '#6B7382' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2.5">
          {tab === 'alertas' && (
            topAlerts.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: '#A8B0BF' }}>Sin alertas activas. Operación normal.</p>
            ) : topAlerts.map(a => (
              <button key={a.id} onClick={() => onPrompt(`Revisa la alerta "${a.titulo}" y dime qué debo hacer`)}
                className="w-full text-left rounded-xl p-3 transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #EDEBE7' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: NIVEL_DOT[a.nivel] || '#4A6FA5' }} />
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: NIVEL_DOT[a.nivel] || '#8A94A6' }}>
                    {a.tipo?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs font-medium leading-snug" style={{ color: '#141821' }}>{a.titulo}</div>
                {a.mensaje && <div className="text-[11px] mt-1 line-clamp-2" style={{ color: '#8A94A6' }}>{a.mensaje}</div>}
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
              className="w-full text-left rounded-xl p-3 text-xs font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
              style={{ border: '1px solid #EDEBE7', color: '#41485A' }}>
              <span className="flex-1">{a}</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#003399' }} />
            </button>
          ))}

          {tab === 'sesiones' && (
            <>
              <button onClick={onNueva}
                className="w-full flex items-center gap-2 rounded-xl p-3 text-xs font-medium transition-colors hover:bg-gray-50"
                style={{ border: '1px dashed #D8D4CE', color: '#003399' }}>
                <Plus className="w-3.5 h-3.5" /> Nueva conversación
              </button>
              {loadingConvs ? (
                <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto" style={{ color: '#A8B0BF' }} /></div>
              ) : conversations.map(c => (
                <div key={c.id} onClick={() => setActiveId(c.id)}
                  className="group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer text-xs transition-colors"
                  style={activeId === c.id
                    ? { background: '#F1F4FB', border: '1px solid #DCE4F6', color: '#141821' }
                    : { border: '1px solid #EDEBE7', color: '#6B7382' }}>
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A8B0BF' }} />
                  <span className="truncate flex-1">{c.metadata?.name || 'Sin título'}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    className="opacity-0 group-hover:opacity-100" style={{ color: '#A8B0BF' }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CTA */}
        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid #F0EEEA' }}>
          <Link to="/informe-ejecutivo"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold tracking-wide"
            style={{ background: '#0A1E4D', color: 'white' }}>
            VER INFORME EJECUTIVO <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}