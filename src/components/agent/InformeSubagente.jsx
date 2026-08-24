import { Network, ArrowRight, BookMarked } from 'lucide-react';

const SEV = {
  critica: { color: 'hsl(var(--danger))', punto: '🔴' },
  advertencia: { color: 'hsl(var(--warn))', punto: '🟡' },
  ok: { color: 'hsl(var(--ok))', punto: '🟢' },
};

// Tarjeta de informe de subagente: el resultado de una delegación se lee
// como un parte de obra, no como un JSON. Patrón 2027: cada agente
// delegado devuelve su propia unidad visual auditable dentro del hilo.
export default function InformeSubagente({ informe, subagente }) {
  const { titulo, sintesis, hallazgos = [], acciones = [], fuentes = [] } = informe;

  return (
    <div className="min-w-0 rounded-xl overflow-hidden bg-surface border border-hairline">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-hairline bg-surface-raised">
        <Network className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground truncate">
          {(subagente || 'Subagente · informe').toUpperCase()}
        </span>
      </div>

      <div className="p-3 space-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground break-words">{titulo}</p>
          <p className="text-[11px] mt-0.5 text-muted-foreground break-words">{sintesis}</p>
        </div>

        {hallazgos.length > 0 && (
          <div className="space-y-1.5">
            {hallazgos.map((h, i) => {
              const sev = SEV[h.severidad] || SEV.advertencia;
              return (
                <div key={i} className="flex gap-2 px-2.5 py-2 rounded-lg bg-surface-raised min-w-0">
                  <span className="w-1 rounded-full flex-shrink-0" style={{ background: sev.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] text-foreground break-words">{h.hallazgo}</span>
                    <span className="block text-[9px] font-mono mt-0.5 break-words" style={{ color: sev.color }}>
                      {sev.punto} {h.impacto}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {acciones.length > 0 && (
          <div className="space-y-1">
            {acciones.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/85 min-w-0">
                <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                <span className="break-words">{a}</span>
              </div>
            ))}
          </div>
        )}

        {fuentes.length > 0 && (
          <div className="flex items-start gap-1.5 pt-1 border-t border-hairline">
            <BookMarked className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <span className="text-[9px] font-mono text-muted-foreground break-words">{fuentes.join(' · ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}