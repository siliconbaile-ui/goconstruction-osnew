import { metaTipo, SEVERIDAD } from './metaGrafo';

// Nodo del grafo dibujado como casilla arrastrable: franja de color por tipo,
// borde por severidad y etiqueta legible dentro de la caja.
export default function NodoCaja({ nodo, seleccionado, atenuado, arrastrando, onPointerDown, onClick }) {
  const meta = metaTipo(nodo.tipo);
  const texto = String(nodo.label);
  const label = texto.length > 26 ? `${texto.slice(0, 26)}…` : texto;
  const w = Math.max(96, Math.min(190, label.length * 6.2 + 26));
  const h = 30;
  const x = nodo.x - w / 2;
  const y = nodo.y - h / 2;
  const critica = nodo.severidad === 'critica';

  return (
    <g
      onPointerDown={onPointerDown}
      onClick={onClick}
      opacity={atenuado ? 0.28 : 1}
      style={{ cursor: arrastrando ? 'grabbing' : 'grab' }}
    >
      {(seleccionado || critica) && (
        <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="10"
          fill="none" stroke={seleccionado ? meta.color : SEVERIDAD.critica}
          strokeWidth="1" opacity={seleccionado ? 0.6 : 0.35} />
      )}
      <rect x={x} y={y} width={w} height={h} rx="7"
        fill="hsl(var(--surface-2))"
        stroke={SEVERIDAD[nodo.severidad] || SEVERIDAD.ok}
        strokeWidth={critica ? 1.8 : 1.1} />
      <rect x={x} y={y} width="4" height={h} rx="2" fill={meta.color} />
      <text x={x + 11} y={nodo.y - 1} fontSize="9.5" fontWeight="600" fill="hsl(var(--foreground))">
        {label}
      </text>
      <text x={x + 11} y={nodo.y + 9} fontSize="7.5" fontFamily="monospace" fill="hsl(var(--muted-foreground))">
        {meta.label.toUpperCase()}
      </text>
    </g>
  );
}