import { TrendingUp, ChevronRight } from 'lucide-react';

function color(desv) {
  if (desv > 5) return 'hsl(var(--danger))';
  if (desv > 0) return 'hsl(var(--warn))';
  return 'hsl(var(--ok))';
}

export default function TarjetaPartidas({ partidas, onPrompt }) {
  const criticas = [...partidas]
    .map(p => ({
      ...p,
      desv: p.avance_programado ? ((p.avance_programado - (p.avance_real || 0)) / p.avance_programado) * 100 : 0,
    }))
    .sort((a, b) => b.desv - a.desv)
    .slice(0, 4);

  const avanceReal = partidas.length
    ? partidas.reduce((s, p) => s + (p.avance_real || 0), 0) / partidas.length : 0;
  const avanceProg = partidas.length
    ? partidas.reduce((s, p) => s + (p.avance_programado || 0), 0) / partidas.length : 0;
  const desvGlobal = avanceProg ? ((avanceProg - avanceReal) / avanceProg) * 100 : 0;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl p-4 bg-surface border border-hairline flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">AVANCE DE PARTIDAS</span>
        <span className="ml-auto text-[10px] font-mono" style={{ color: color(desvGlobal) }}>
          {desvGlobal > 0 ? '-' : '+'}{Math.abs(desvGlobal).toFixed(1)}%
        </span>
      </div>

      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-semibold leading-none text-foreground">{avanceReal.toFixed(1)}%</span>
        <span className="text-[11px] font-mono mb-0.5 text-muted-foreground">real · prog {avanceProg.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-4 bg-surface-raised relative">
        <div className="h-full rounded-full" style={{ width: `${Math.min(avanceReal, 100)}%`, background: color(desvGlobal) }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/50" style={{ left: `${Math.min(avanceProg, 100)}%` }} />
      </div>

      <div className="space-y-1.5 flex-1">
        {criticas.length === 0 && <p className="text-xs text-muted-foreground">Sin partidas cargadas todavía.</p>}
        {criticas.map(p => (
          <button key={p.id} onClick={() => onPrompt(`Analiza la partida "${p.nombre}" (${p.codigo || 's/c'}): avance real vs programado, causa de la desviación y qué hago hoy.`)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left bg-surface-raised active:scale-[0.99] transition-transform">
            <span className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: color(p.desv) }} />
            <span className="flex-1 min-w-0 truncate text-xs text-foreground">{p.nombre}</span>
            <span className="text-[10px] font-mono flex-shrink-0" style={{ color: color(p.desv) }}>
              {(p.avance_real || 0).toFixed(0)}%
            </span>
            <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}