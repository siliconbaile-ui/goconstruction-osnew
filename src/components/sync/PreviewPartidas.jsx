import OrionCard from '@/components/OrionCard';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function PreviewPartidas({ filas }) {
  const valida = (f) => f.nombre && String(f.nombre).trim().length > 0;
  const validas = filas.filter(valida).length;

  return (
    <OrionCard className="p-0 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--surface-2))' }}>
        <div className="font-mono text-xs uppercase" style={{ color: 'hsl(var(--muted-foreground))' }}>
          PREVISUALIZACIÓN · {filas.length} FILAS DETECTADAS
        </div>
        <div className="font-mono text-xs flex items-center gap-1" style={{ color: validas === filas.length ? 'hsl(var(--ok))' : 'hsl(var(--warn))' }}>
          {validas === filas.length ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {validas} VÁLIDAS
        </div>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0" style={{ background: 'hsl(var(--surface-0))' }}>
            <tr style={{ color: 'hsl(var(--muted-foreground))' }}>
              {['CÓDIGO', 'NOMBRE', 'CATEGORÍA', 'PROG. %', 'REAL %', 'MONTO USD', 'SUBCONTRATISTA', 'ESTADO'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} style={{ borderTop: '1px solid hsl(var(--surface-2))', color: valida(f) ? 'hsl(var(--hairline))' : 'hsl(var(--danger))' }}>
                <td className="px-3 py-2 whitespace-nowrap">{f.codigo || '—'}</td>
                <td className="px-3 py-2">{f.nombre || '⚠ sin nombre'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{f.categoria || '—'}</td>
                <td className="px-3 py-2">{f.avance_programado ?? 0}</td>
                <td className="px-3 py-2">{f.avance_real ?? 0}</td>
                <td className="px-3 py-2 whitespace-nowrap">{f.monto_contrato_usd ? Number(f.monto_contrato_usd).toLocaleString('en-US') : '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{f.subcontratista || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{f.estado || 'pendiente'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OrionCard>
  );
}