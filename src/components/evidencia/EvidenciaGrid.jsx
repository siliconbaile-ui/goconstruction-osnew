import { MapPin, Camera } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import { formatFecha } from '@/lib/orionUtils';

export default function EvidenciaGrid({ inspecciones, partidas }) {
  if (inspecciones.length === 0) {
    return (
      <OrionCard className="p-8 text-center">
        <Camera className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
        <p className="text-slate-500 font-mono text-xs">SIN EVIDENCIA VISUAL REGISTRADA</p>
      </OrionCard>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {inspecciones.map(i => {
        const partida = partidas.find(p => p.id === i.partida_id);
        return (
          <OrionCard key={i.id} className="overflow-hidden">
            {i.evidencia_foto_url && (
              <img src={i.evidencia_foto_url} alt="Evidencia" className="w-full h-40 object-cover" />
            )}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  i.gravedad === 'critica' ? 'bg-red-600/10 text-red-400 border-red-500/30' :
                  i.gravedad === 'moderada' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/30'
                }`}>{i.gravedad?.toUpperCase()}</span>
                {i.es_no_conformidad && <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-orange-600/10 text-orange-400 border-orange-500/30">NC</span>}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-blue-500/10 text-blue-400 border-blue-500/30">{i.estado?.toUpperCase()}</span>
              </div>
              <div className="text-sm text-white leading-snug">{i.descripcion || '—'}</div>
              {i.observacion && <div className="text-xs whitespace-pre-line" style={{ color: '#4A6FA5' }}>{i.observacion}</div>}
              <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px]" style={{ color: '#2D4A6E' }}>
                {i.coordenadas_gps ? (
                  <a href={`https://www.google.com/maps?q=${encodeURIComponent(i.coordenadas_gps)}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1" style={{ color: '#27AE60' }}>
                    <MapPin className="w-3 h-3" /> {i.coordenadas_gps}
                  </a>
                ) : (
                  <span className="flex items-center gap-1" style={{ color: '#D35400' }}><MapPin className="w-3 h-3" /> SIN GPS</span>
                )}
                {partida && <span>{partida.nombre}</span>}
                <span>{formatFecha(i.created_date)}</span>
              </div>
            </div>
          </OrionCard>
        );
      })}
    </div>
  );
}