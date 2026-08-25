import { useMemo, useState } from 'react';
import { Network, Maximize2, Minimize2 } from 'lucide-react';
import { calcularLayout } from './layoutGrafo';
import { metaTipo, SEVERIDAD, TIPOS } from './metaGrafo';
import NodoDetalle from './NodoDetalle';

const ANCHO = 640;
const ALTO = 420;

// Grafo de conocimiento de la obra, interactivo dentro del hilo: toca un nodo
// para ver su ficha y sus conexiones, y toca una conexión para saltar a ella.
export default function GrafoInteractivo({ grafo, resumen }) {
  const { nodos = [], aristas = [], modo, foco } = grafo || {};
  const [selId, setSelId] = useState(null);
  const [expandido, setExpandido] = useState(false);

  const conLayout = useMemo(
    () => calcularLayout(nodos, aristas, { ancho: ANCHO, alto: ALTO }),
    [nodos, aristas]
  );
  const porId = useMemo(() => new Map(conLayout.map(n => [n.id, n])), [conLayout]);

  const sel = selId ? porId.get(selId) : null;
  const vecinos = useMemo(() => {
    if (!selId) return [];
    return aristas
      .filter(a => a.origen === selId || a.destino === selId)
      .map(a => ({
        rel: a.rel,
        direccion: a.origen === selId ? 'sale' : 'entra',
        nodo: porId.get(a.origen === selId ? a.destino : a.origen),
      }))
      .filter(v => v.nodo);
  }, [selId, aristas, porId]);

  const conectados = new Set(vecinos.map(v => v.nodo.id));
  const tiposPresentes = [...new Set(nodos.map(n => n.tipo))];

  return (
    <div className="min-w-0 rounded-xl overflow-hidden bg-surface border border-hairline">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-hairline bg-surface-raised">
        <Network className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground truncate">
          GRAFO DE OBRA · {(foco ? `FOCO ${foco}` : (modo || 'obra')).toString().toUpperCase()} · {nodos.length} NODOS · {aristas.length} RELACIONES
        </span>
        <button onClick={() => setExpandido(e => !e)} className="ml-auto p-1 flex-shrink-0">
          {expandido
            ? <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
            : <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>

      <div className="w-full" style={{ height: expandido ? 520 : 300 }}>
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {aristas.map((a, i) => {
            const s = porId.get(a.origen);
            const t = porId.get(a.destino);
            if (!s || !t) return null;
            const activa = selId && (a.origen === selId || a.destino === selId);
            const bloqueo = a.rel === 'BLOQUEA';
            return (
              <g key={i}>
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={bloqueo ? 'hsl(var(--danger))' : 'hsl(var(--hairline))'}
                  strokeWidth={activa ? 2 : bloqueo ? 1.6 : 1}
                  strokeDasharray={bloqueo ? '4 3' : undefined}
                  opacity={selId ? (activa ? 1 : 0.18) : bloqueo ? 0.9 : 0.55}
                />
                {activa && (
                  <text
                    x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 4}
                    textAnchor="middle" fontSize="8" fontFamily="monospace"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {a.rel}
                  </text>
                )}
              </g>
            );
          })}

          {conLayout.map(n => {
            const meta = metaTipo(n.tipo);
            const atenuado = selId && n.id !== selId && !conectados.has(n.id);
            return (
              <g key={n.id} onClick={() => setSelId(n.id === selId ? null : n.id)} style={{ cursor: 'pointer' }}
                opacity={atenuado ? 0.22 : 1}>
                {n.id === selId && (
                  <circle cx={n.x} cy={n.y} r={n.r + 7} fill="none" stroke={meta.color} strokeWidth="1" opacity="0.5" />
                )}
                <circle cx={n.x} cy={n.y} r={n.r} fill={meta.color}
                  stroke={SEVERIDAD[n.severidad] || SEVERIDAD.ok} strokeWidth={n.severidad === 'critica' ? 3 : 1.8} />
                <text x={n.x} y={n.y + n.r + 10} textAnchor="middle" fontSize="8.5"
                  fill="hsl(var(--foreground))" opacity={atenuado ? 0.4 : 0.9}>
                  {String(n.label).slice(0, 22)}{String(n.label).length > 22 ? '…' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="px-3 pb-3 space-y-2">
        {sel
          ? <NodoDetalle nodo={sel} vecinos={vecinos} onCerrar={() => setSelId(null)} onFocar={setSelId} />
          : (
            <p className="text-[10px] text-muted-foreground">
              Toca un nodo para ver su estado y sus conexiones.
              {resumen?.bloqueos_calidad_pago > 0 && ` · ${resumen.bloqueos_calidad_pago} bloqueo(s) calidad→pago en rojo punteado.`}
            </p>
          )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-hairline">
          {tiposPresentes.map(t => {
            const m = TIPOS[t] || metaTipo(t);
            return (
              <span key={t} className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                {m.label.toUpperCase()}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}