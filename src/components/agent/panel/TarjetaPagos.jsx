import { Wallet, ChevronRight, Lock } from 'lucide-react';

const ESTADO = {
  bloqueado_calidad: { label: 'BLOQUEADO', color: 'hsl(var(--danger))' },
  pendiente_firma: { label: 'POR FIRMAR', color: 'hsl(var(--warn))' },
  aprobado: { label: 'APROBADO', color: 'hsl(var(--ok))' },
  borrador: { label: 'BORRADOR', color: 'hsl(var(--muted-foreground))' },
  rechazado: { label: 'RECHAZADO', color: 'hsl(var(--danger))' },
  pagado: { label: 'PAGADO', color: 'hsl(var(--ok))' },
};

const usd = n => `USD ${Math.round(n || 0).toLocaleString('es-CL')}`;

export default function TarjetaPagos({ edps, onPrompt }) {
  const bloqueados = edps.filter(e => e.estado === 'bloqueado_calidad');
  const montoBloqueado = bloqueados.reduce((s, e) => s + (e.monto_usd || 0), 0);

  return (
    <div className="rounded-2xl p-4 bg-surface border border-hairline flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">ESTADOS DE PAGO</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">{edps.length} EDP</span>
      </div>

      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-semibold leading-none"
          style={{ color: montoBloqueado > 0 ? 'hsl(var(--danger))' : 'hsl(var(--ok))' }}>
          {usd(montoBloqueado)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] mb-4 text-muted-foreground">
        <Lock className="w-3 h-3" />
        retenidos por calidad en {bloqueados.length} EDP
      </div>

      <div className="space-y-1.5 flex-1">
        {edps.length === 0 && <p className="text-xs text-muted-foreground">Sin estados de pago en curso.</p>}
        {edps.slice(0, 4).map(e => {
          const meta = ESTADO[e.estado] || ESTADO.borrador;
          return (
            <button key={e.id} onClick={() => onPrompt(`Revisa el EDP ${e.numero_edp || e.id} de ${e.subcontratista || 'subcontratista'}: estado, motivo de bloqueo y qué se necesita para liberarlo.`)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left bg-surface-raised active:scale-[0.99] transition-transform">
              <span className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: meta.color }} />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-xs text-foreground">{e.subcontratista || e.numero_edp || 'EDP'}</span>
                <span className="block text-[9px] font-mono" style={{ color: meta.color }}>{meta.label}</span>
              </span>
              <span className="text-[10px] font-mono flex-shrink-0 text-muted-foreground">{usd(e.monto_usd)}</span>
              <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}