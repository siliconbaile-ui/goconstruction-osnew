import OrionCard from '@/components/OrionCard';
import { FileBarChart, AlertTriangle, ListChecks, Trash2 } from 'lucide-react';

const SEMAFORO = {
  verde: { color: '#27AE60', label: 'VERDE · BAJO CONTROL' },
  amarillo: { color: '#F39C12', label: 'AMARILLO · ATENCIÓN' },
  rojo: { color: '#D35400', label: 'ROJO · CRÍTICO' },
};

export default function InformeCard({ informe, onEliminar }) {
  const sem = SEMAFORO[informe.estado_general] || SEMAFORO.verde;

  return (
    <OrionCard className="p-5" style={{ borderColor: `${sem.color}55` }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: `${sem.color}18`, border: `1px solid ${sem.color}55` }}>
            <FileBarChart className="w-4 h-4" style={{ color: sem.color }} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{informe.periodo || 'Informe'}</div>
            <div className="font-mono text-[10px]" style={{ color: '#4A6FA5' }}>
              {informe.fecha_generacion ? new Date(informe.fecha_generacion).toLocaleString('es-CL') : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap" style={{ background: `${sem.color}18`, color: sem.color, border: `1px solid ${sem.color}55` }}>
            {sem.label}
          </span>
          <button onClick={() => onEliminar(informe)} className="p-1.5 rounded text-slate-500 hover:text-orange-400" title="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {[
          { l: 'AVANCE REAL', v: `${(informe.avance_real ?? 0).toFixed(1)}%` },
          { l: 'PROGRAMADO', v: `${(informe.avance_programado ?? 0).toFixed(1)}%` },
          { l: 'DESVIACIÓN', v: `${(informe.desviacion ?? 0).toFixed(1)}%`, c: (informe.desviacion ?? 0) > 5 ? '#D35400' : '#27AE60' },
          { l: 'NC ABIERTAS', v: informe.nc_abiertas ?? 0, c: (informe.nc_abiertas ?? 0) > 0 ? '#F39C12' : '#27AE60' },
          { l: 'RDIs ABIERTOS', v: informe.rdis_abiertos ?? 0 },
          { l: 'USD BLOQUEADO', v: `$${(informe.monto_bloqueado_usd ?? 0).toLocaleString('en-US')}`, c: (informe.monto_bloqueado_usd ?? 0) > 0 ? '#D35400' : '#27AE60' },
        ].map(k => (
          <div key={k.l} className="p-2.5 rounded" style={{ background: '#0A1628', border: '1px solid #131F36' }}>
            <div className="font-mono text-[9px] tracking-wider mb-1" style={{ color: '#4A6FA5' }}>{k.l}</div>
            <div className="text-sm font-bold" style={{ color: k.c || '#FFFFFF' }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="font-mono text-[10px] tracking-wider mb-1" style={{ color: '#4A6FA5' }}>RESUMEN EJECUTIVO</div>
          <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#CBD5E1' }}>{informe.resumen_ejecutivo}</p>
        </div>
        {informe.riesgos_principales && (
          <div className="p-3 rounded" style={{ background: 'rgba(211,84,0,0.06)', border: '1px solid rgba(211,84,0,0.25)' }}>
            <div className="font-mono text-[10px] tracking-wider mb-1 flex items-center gap-1" style={{ color: '#D35400' }}>
              <AlertTriangle className="w-3 h-3" /> RIESGOS PRINCIPALES
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-xs" style={{ color: '#E2B49A' }}>{informe.riesgos_principales}</p>
          </div>
        )}
        {informe.acciones_recomendadas && (
          <div className="p-3 rounded" style={{ background: 'rgba(0,51,153,0.08)', border: '1px solid rgba(0,51,153,0.3)' }}>
            <div className="font-mono text-[10px] tracking-wider mb-1 flex items-center gap-1" style={{ color: '#5B8DEF' }}>
              <ListChecks className="w-3 h-3" /> ACCIONES RECOMENDADAS
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-xs" style={{ color: '#B6C9EA' }}>{informe.acciones_recomendadas}</p>
          </div>
        )}
      </div>
    </OrionCard>
  );
}