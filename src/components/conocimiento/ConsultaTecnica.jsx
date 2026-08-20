import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, Quote, AlertTriangle, ShieldCheck } from 'lucide-react';
import OrionCard from '@/components/OrionCard';

export default function ConsultaTecnica({ proyectoId }) {
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [res, setRes] = useState(null);
  const [ms, setMs] = useState(null);

  const consultar = async () => {
    if (!pregunta.trim() || cargando) return;
    setCargando(true);
    setRes(null);
    const t0 = Date.now();
    try {
      const r = await base44.functions.invoke('consultarBaseConocimiento', {
        pregunta,
        proyecto_id: proyectoId || undefined,
      });
      setRes(r.data);
      setMs(Date.now() - t0);
    } finally {
      setCargando(false);
    }
  };

  return (
    <OrionCard className="p-5">
      <div className="font-mono text-xs mb-3 uppercase" style={{ color: '#4A6FA5' }}>
        Q&amp;A TÉCNICO · RESPUESTA CON PÁGINA CITADA
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={pregunta}
          onChange={e => setPregunta(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && consultar()}
          placeholder="¿Qué tubería exige la EETT para la caldera? ¿Qué recubrimiento lleva la losa del piso 3?"
          className="flex-1 px-3 py-2.5 rounded text-sm text-white font-mono min-w-0"
          style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
        />
        <button onClick={consultar} disabled={cargando || !pregunta.trim()}
          className="px-4 py-2.5 rounded text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
          style={{ background: '#003399' }}>
          {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Consultar
        </button>
      </div>

      {cargando && (
        <div className="font-mono text-xs" style={{ color: '#4A6FA5' }}>
          Buscando en planos, EETT y normativas indexadas...
        </div>
      )}

      {res && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
            {ms !== null && (
              <span className="px-2 py-0.5 rounded" style={{ background: '#0A1628', border: '1px solid #1E2D4A', color: ms < 3000 ? '#27AE60' : '#F39C12' }}>
                {(ms / 1000).toFixed(1)}s
              </span>
            )}
            <span className="px-2 py-0.5 rounded flex items-center gap-1" style={{
              background: res.sin_respuesta ? 'rgba(211,84,0,0.1)' : 'rgba(39,174,96,0.1)',
              border: `1px solid ${res.sin_respuesta ? 'rgba(211,84,0,0.35)' : 'rgba(39,174,96,0.35)'}`,
              color: res.sin_respuesta ? '#D35400' : '#27AE60',
            }}>
              {res.sin_respuesta ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              {res.sin_respuesta ? 'SIN RESPALDO DOCUMENTAL' : `VERIFICADO · CONFIANZA ${Math.round(res.confianza || 0)}%`}
            </span>
            {res.contradiccion_detectada && (
              <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.35)', color: '#F39C12' }}>
                CONTRADICCIÓN ENTRE DOCUMENTOS → EMITIR RDI
              </span>
            )}
          </div>

          <div className="p-4 rounded text-sm text-slate-200 leading-relaxed whitespace-pre-wrap"
            style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
            {res.respuesta || res.error}
          </div>

          {res.citas?.length > 0 && (
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#4A6FA5' }}>
                Respaldo documental
              </div>
              {res.citas.map((c, i) => (
                <div key={i} className="p-3 rounded" style={{ background: 'rgba(0,51,153,0.08)', border: '1px solid rgba(0,51,153,0.35)' }}>
                  <div className="flex items-center gap-2 mb-1 font-mono text-[10px]" style={{ color: '#5B8DEF' }}>
                    <Quote className="w-3 h-3" />
                    <span className="truncate">{c.documento}</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: '#0A1628', color: '#27AE60' }}>
                      PÁG. {c.pagina}
                    </span>
                  </div>
                  {c.fragmento && <p className="text-xs italic text-slate-300">"{c.fragmento}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </OrionCard>
  );
}