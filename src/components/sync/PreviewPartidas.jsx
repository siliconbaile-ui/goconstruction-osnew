import OrionCard from '@/components/OrionCard';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function PreviewPartidas({ filas }) {
  const valida = (f) => f.nombre && String(f.nombre).trim().length > 0;
  const validas = filas.filter(valida).length;

  return (
    <OrionCard className="p-0 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1E2D4A' }}>
        <div className="font-mono text-xs uppercase" style={{ color: '#4A6FA5' }}>
          PREVISUALIZACIÓN · {filas.length} FILAS DETECTADAS
        </div>
        <div className="font-mono text-xs flex items-center gap-1" style={{ color: validas === filas.length ? '#27AE60' : '#F39C12' }}>
          {validas === filas.length ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {validas} VÁLIDAS
        </div>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0" style={{ background: '#0A1628' }}>
            <tr style={{ color: '#4A6FA5' }}>
              {['CÓDIGO', 'NOMBRE', 'CATEGORÍA', 'PROG. %', 'REAL %', 'MONTO USD', 'SUBCONTRATISTA', 'ESTADO'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} style={{ borderTop: '1px solid #131F36', color: valida(f) ? '#CBD5E1' : '#D35400' }}>
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