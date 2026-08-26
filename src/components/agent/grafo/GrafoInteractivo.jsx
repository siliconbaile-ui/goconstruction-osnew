import { useMemo, useState } from 'react';
import { Network, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { calcularLayout } from './layoutGrafo';
import { metaTipo, TIPOS } from './metaGrafo';
import { useArrastreNodos } from './useArrastreNodos';
import NodoCaja from './NodoCaja';
import NodoDetalle from './NodoDetalle';

const ANCHO = 780;
const ALTO = 470;

// Grafo de conocimiento de la obra, interactivo dentro del hilo: arrastra las
// casillas para ordenar la vista, tócalas para ver su ficha y sus conexiones.
export default function GrafoInteractivo({ grafo, resumen }) {
  const { nodos = [], aristas = [], modo, foco } = grafo || {};
  const [selId, setSelId] = useState(null);
  const [expandido, setExpandido] = useState(false);

  const conLayout = useMemo(
    () => calcularLayout(nodos, aristas, { ancho: ANCHO, alto: ALTO }),
    [nodos, aristas]
  );
  const { svgRef, posicionar, iniciar, mover, soltar, seMovio, reordenar, hayMovidos, arrastrandoId } =
    useArrastreNodos(conLayout, { ancho: ANCHO, alto: ALTO });

  const ubicados = useMemo(() => conLayout.map(posicionar), [conLayout, posicionar]);
  const porId = useMemo(() => new Map(ubicados.map(n => [n.id, n])), [ubicados]);

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

  // Expandido = pantalla completa sobre la app; la burbuja del chat queda atrás.
  const contenedor = expandido
    ? 'fixed inset-0 z-[100] flex flex-col rounded-none bg-surface'
    : 'min-w-0 rounded-xl overflow-hidden bg-surface border border-hairline';

  const seleccionar = (id) => () => {
    if (seMovio()) return; // fue un arrastre, no un toque
    setSelId(prev => (prev === id ? null : id));
  };

  return (
    <div className={contenedor}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-hairline bg-surface-raised flex-shrink-0">
        <Network className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground truncate">
          GRAFO DE OBRA · {(foco ? `FOCO ${foco}` : (modo || 'obra')).toString().toUpperCase()} · {nodos.length} NODOS · {aristas.length} RELACIONES
        </span>
        {hayMovidos && (
          <button onClick={reordenar}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md flex-shrink-0 border border-hairline bg-surface text-muted-foreground">
            <RotateCcw className="w-3 h-3" /><span className="text-[9px] font-mono hidden sm:inline">REORDENAR</span>
          </button>
        )}
        <button onClick={() => setExpandido(e => !e)}
          className={`${hayMovidos ? '' : 'ml-auto'} flex items-center gap-1.5 px-2 py-1 rounded-md flex-shrink-0 border border-hairline bg-surface text-muted-foreground`}>
          {expandido
            ? <><Minimize2 className="w-3.5 h-3.5" /><span className="text-[9px] font-mono">CERRAR</span></>
            : <><Maximize2 className="w-3.5 h-3.5" /><span className="text-[9px] font-mono hidden sm:inline">EXPANDIR</span></>}
        </button>
      </div>

      <div className={`w-full ${expandido ? 'flex-1 min-h-0' : ''}`} style={expandido ? undefined : { height: 320 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          className="w-full h-full touch-none select-none"
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerLeave={soltar}
        >
          <defs>
            <marker id="flecha" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="hsl(var(--muted-foreground))" opacity="0.7" />
            </marker>
            <marker id="flechaBloqueo" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="hsl(var(--danger))" />
            </marker>
          </defs>

          {aristas.map((a, i) => {
            const s = porId.get(a.origen);
            const t = porId.get(a.destino);
            if (!s || !t) return null;
            const activa = selId && (a.origen === selId || a.destino === selId);
            const bloqueo = a.rel === 'BLOQUEA';
            // Curva suave: separa relaciones paralelas y se lee mejor entre casillas.
            const mx = (s.x + t.x) / 2 + (t.y - s.y) * 0.12;
            const my = (s.y + t.y) / 2 - (t.x - s.x) * 0.12;
            return (
              <g key={i}>
                <path
                  d={`M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`}
                  fill="none"
                  stroke={bloqueo ? 'hsl(var(--danger))' : 'hsl(var(--hairline))'}
                  strokeWidth={activa ? 2 : bloqueo ? 1.6 : 1}
                  strokeDasharray={bloqueo ? '4 3' : undefined}
                  markerEnd={bloqueo ? 'url(#flechaBloqueo)' : 'url(#flecha)'}
                  opacity={selId ? (activa ? 1 : 0.14) : bloqueo ? 0.9 : 0.5}
                />
                {activa && (
                  <text x={mx} y={my - 3} textAnchor="middle" fontSize="8" fontFamily="monospace"
                    fill="hsl(var(--muted-foreground))">
                    {a.rel}
                  </text>
                )}
              </g>
            );
          })}

          {ubicados.map(n => (
            <NodoCaja
              key={n.id}
              nodo={n}
              seleccionado={n.id === selId}
              atenuado={selId && n.id !== selId && !conectados.has(n.id)}
              arrastrando={arrastrandoId === n.id}
              onPointerDown={iniciar(n.id)}
              onClick={seleccionar(n.id)}
            />
          ))}
        </svg>
      </div>

      <div className="px-3 pb-3 space-y-2 flex-shrink-0">
        {sel
          ? <NodoDetalle nodo={sel} vecinos={vecinos} onCerrar={() => setSelId(null)} onFocar={setSelId} />
          : (
            <p className="text-[10px] text-muted-foreground">
              Arrastra las casillas para ordenar el grafo · tócalas para ver su estado y conexiones.
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