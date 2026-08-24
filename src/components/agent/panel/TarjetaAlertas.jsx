import { Siren, ChevronRight } from 'lucide-react';

const NIVEL = {
  critica: { color: 'hsl(var(--danger))', label: 'CRÍTICA' },
  advertencia: { color: 'hsl(var(--warn))', label: 'ADVERTENCIA' },
  info: { color: 'hsl(var(--info))', label: 'INFO' },
};

export default function TarjetaAlertas({ alertas, onPrompt }) {
  const criticas = alertas.filter(a => a.nivel === 'critica').length;

  return (
    <div className="rounded-2xl p-4 bg-surface border border-hairline flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Siren className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">ALERTAS DE TERRENO</span>
        {criticas > 0 && (
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono"
            style={{ background: 'hsl(var(--danger) / 0.15)', color: 'hsl(var(--danger))' }}>
            {criticas} CRÍTICA{criticas > 1 ? 'S' : ''}
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-3xl font-semibold leading-none"
          style={{ color: alertas.length ? 'hsl(var(--warn))' : 'hsl(var(--ok))' }}>
          {alertas.length}
        </span>
        <span className="text-[11px] font-mono mb-0.5 text-muted-foreground">activas ahora</span>
      </div>

      <div className="space-y-1.5 flex-1">
        {alertas.length === 0 && <p className="text-xs text-muted-foreground">Terreno sin alertas activas.</p>}
        {alertas.slice(0, 4).map(a => {
          const meta = NIVEL[a.nivel] || NIVEL.advertencia;
          return (
            <button key={a.id} onClick={() => onPrompt(`Alerta "${a.titulo}": explícame la causa raíz con los datos de la obra y dime la acción correctiva concreta.`)}
              className="w-full flex items-start gap-2 px-2.5 py-2 rounded-lg text-left bg-surface-raised active:scale-[0.99] transition-transform">
              <span className="w-1 h-6 rounded-full flex-shrink-0 mt-0.5" style={{ background: meta.color }} />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-xs text-foreground">{a.titulo}</span>
                <span className="block text-[9px] font-mono" style={{ color: meta.color }}>
                  {meta.label} · {(a.tipo || '').replace(/_/g, ' ')}
                </span>
              </span>
              <ChevronRight className="w-3 h-3 flex-shrink-0 mt-1 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}