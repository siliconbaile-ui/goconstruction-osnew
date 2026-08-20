import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, MapPin, Loader2, X } from 'lucide-react';

// Captura foto de terreno + coordenadas GPS reales para adjuntar a un RDI.
export default function EvidenciaGeo({ valor, onChange }) {
  const inputRef = useRef(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const pedirGPS = () => new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({
        coordenadas_gps: `${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`,
        precision_gps_m: Math.round(p.coords.accuracy || 0),
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  const capturar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setCargando(true);
    try {
      const [{ file_url }, gps] = await Promise.all([
        base44.integrations.Core.UploadFile({ file }),
        pedirGPS(),
      ]);
      onChange({ evidencia_url: file_url, coordenadas_gps: gps?.coordenadas_gps || '', precision_gps_m: gps?.precision_gps_m });
      if (!gps) setError('Foto adjunta sin GPS: activa la ubicación para georreferenciar el RDI.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Evidencia georreferenciada</label>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={capturar} />

      {!valor.evidencia_url ? (
        <button onClick={() => inputRef.current?.click()} disabled={cargando}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded text-sm text-white disabled:opacity-50"
          style={{ background: 'rgba(0,51,153,0.2)', border: '1px dashed #1E2D4A' }}>
          {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          {cargando ? 'Subiendo foto y leyendo GPS...' : 'Tomar foto en terreno'}
        </button>
      ) : (
        <div className="flex items-center gap-3 p-2 rounded" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
          <img src={valor.evidencia_url} alt="Evidencia" className="w-12 h-12 object-cover rounded flex-shrink-0" />
          <div className="flex-1 min-w-0 font-mono text-[10px]" style={{ color: valor.coordenadas_gps ? '#27AE60' : '#D35400' }}>
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {valor.coordenadas_gps || 'SIN GPS'}
            </div>
            {valor.precision_gps_m ? <div style={{ color: '#4A6FA5' }}>±{valor.precision_gps_m} m</div> : null}
          </div>
          <button onClick={() => onChange({ evidencia_url: '', coordenadas_gps: '', precision_gps_m: undefined })}
            className="p-1.5 rounded text-slate-400 hover:text-white flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-[10px]" style={{ color: '#D35400' }}>{error}</p>}
    </div>
  );
}