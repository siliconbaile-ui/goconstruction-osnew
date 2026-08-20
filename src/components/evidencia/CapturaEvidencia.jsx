import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, MapPin, Loader2, Sparkles, Check } from 'lucide-react';
import OrionCard from '@/components/OrionCard';

export default function CapturaEvidencia({ proyecto, partidas, onRegistrada }) {
  const inputRef = useRef(null);
  const [fase, setFase] = useState('idle');
  const [fotoUrl, setFotoUrl] = useState(null);
  const [gps, setGps] = useState(null);
  const [analisis, setAnalisis] = useState(null);
  const [partidaId, setPartidaId] = useState('');
  const [error, setError] = useState(null);

  const pedirGPS = () => new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve(`${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setAnalisis(null);
    setFase('subiendo');
    const [{ file_url }, coords] = await Promise.all([
      base44.integrations.Core.UploadFile({ file }),
      pedirGPS(),
    ]);
    setFotoUrl(file_url);
    setGps(coords);
    setFase('analizando');
    const partida = partidas.find(p => p.id === partidaId);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un ITO (inspector técnico de obra) senior en Chile. Analiza esta foto de terreno con criterio técnico y sin inventar datos que no se vean en la imagen.

${partida ? `Partida asociada: ${partida.nombre} (avance real ${partida.avance_real || 0}%).` : 'Sin partida asociada indicada.'}

Entrega:
- descripcion: qué se observa técnicamente (elemento, faena, estado). Máx 40 palabras.
- hallazgo: el posible defecto o incumplimiento detectado, o "sin hallazgos visibles". Máx 40 palabras.
- gravedad: leve, moderada o critica.
- es_no_conformidad: true solo si el hallazgo constituye una no conformidad clara.
- verificar: qué debe verificarse contra planos/EETT antes de continuar (ej: recubrimiento, diámetro, traslapo, limpieza previa al vaciado). Máx 30 palabras.
- bloquea_vaciado: true si NO se debe vaciar hormigón hasta resolver el hallazgo.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          descripcion: { type: 'string' },
          hallazgo: { type: 'string' },
          gravedad: { type: 'string' },
          es_no_conformidad: { type: 'boolean' },
          verificar: { type: 'string' },
          bloquea_vaciado: { type: 'boolean' },
        }
      }
    });
    setAnalisis(result);
    setFase('revision');
  };

  const registrar = async () => {
    setFase('registrando');
    const insp = await base44.entities.InspeccionCalidad.create({
      proyecto_id: proyecto.id,
      partida_id: partidaId || '',
      tipo: 'foto',
      gravedad: ['leve', 'moderada', 'critica'].includes(analisis.gravedad) ? analisis.gravedad : 'leve',
      estado: 'abierta',
      descripcion: analisis.descripcion,
      observacion: `${analisis.hallazgo}\nVerificar: ${analisis.verificar}${analisis.bloquea_vaciado ? '\n⛔ NO VACIAR hasta resolver.' : ''}`,
      evidencia_foto_url: fotoUrl,
      coordenadas_gps: gps || '',
      es_no_conformidad: !!analisis.es_no_conformidad,
      pilar: 'tecnologia',
    });
    if (analisis.bloquea_vaciado && partidaId) {
      await base44.entities.PartidaControl.update(partidaId, { estado_calidad: 'pendiente', estado_pago: 'bloqueado' });
    }
    onRegistrada(insp);
    setFase('idle');
    setFotoUrl(null);
    setAnalisis(null);
    setGps(null);
  };

  const ocupado = ['subiendo', 'analizando', 'registrando'].includes(fase);

  return (
    <OrionCard className="p-5">
      <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>CAPTURA GEORREFERENCIADA · ANTI FIERRO FANTASMA</div>

      <div className="mb-3">
        <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Partida (recomendado)</label>
        <select value={partidaId} onChange={e => setPartidaId(e.target.value)} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
          <option value="">Sin partida</option>
          {partidas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={ocupado || !proyecto}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: '#003399' }}
      >
        {ocupado ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        {fase === 'subiendo' ? 'Subiendo foto y leyendo GPS...' :
         fase === 'analizando' ? 'Orion está inspeccionando la foto...' :
         fase === 'registrando' ? 'Registrando evidencia...' :
         'Tomar foto de terreno'}
      </button>

      {error && <p className="mt-2 text-xs" style={{ color: '#D35400' }}>{error}</p>}

      {fase === 'revision' && analisis && (
        <div className="mt-4 space-y-3">
          <img src={fotoUrl} alt="Evidencia" className="w-full max-h-64 object-cover rounded" style={{ border: '1px solid #1E2D4A' }} />
          <div className="flex items-center gap-2 font-mono text-[10px]" style={{ color: gps ? '#27AE60' : '#D35400' }}>
            <MapPin className="w-3 h-3" />
            {gps ? `GPS ${gps}` : 'SIN GPS · evidencia sin georreferencia'}
          </div>
          <div className="p-3 rounded text-xs space-y-2" style={{ background: 'rgba(0,51,153,0.08)', border: '1px solid rgba(0,51,153,0.35)' }}>
            <div className="font-mono text-[10px] flex items-center gap-1" style={{ color: '#5B8DEF' }}>
              <Sparkles className="w-3 h-3" /> INSPECCIÓN ITO · ORION
            </div>
            <div className="text-slate-300">{analisis.descripcion}</div>
            <div className="text-slate-300"><span className="font-mono text-[10px]" style={{ color: '#4A6FA5' }}>HALLAZGO: </span>{analisis.hallazgo}</div>
            <div className="text-slate-300"><span className="font-mono text-[10px]" style={{ color: '#4A6FA5' }}>VERIFICAR: </span>{analisis.verificar}</div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-slate-500/10 text-slate-400 border-slate-500/30">{String(analisis.gravedad).toUpperCase()}</span>
              {analisis.es_no_conformidad && <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-orange-600/10 text-orange-400 border-orange-500/30">NO CONFORMIDAD</span>}
              {analisis.bloquea_vaciado && <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-red-600/10 text-red-400 border-red-500/30">⛔ NO VACIAR</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={registrar} className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
              <Check className="w-4 h-4" /> Registrar inspección
            </button>
            <button onClick={() => { setFase('idle'); setAnalisis(null); setFotoUrl(null); }} className="px-4 py-2 rounded text-sm text-slate-400" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>Descartar</button>
          </div>
        </div>
      )}
    </OrionCard>
  );
}