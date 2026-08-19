import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { UploadCloud, Loader2, Database, CheckCircle, XCircle, FileSpreadsheet, Clock } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import PreviewPartidas from '@/components/sync/PreviewPartidas';

const ESQUEMA = {
  type: 'object',
  properties: {
    partidas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          codigo: { type: 'string' },
          nombre: { type: 'string' },
          categoria: { type: 'string' },
          avance_programado: { type: 'number' },
          avance_real: { type: 'number' },
          fecha_inicio_programada: { type: 'string' },
          fecha_fin_programada: { type: 'string' },
          monto_contrato_usd: { type: 'number' },
          subcontratista: { type: 'string' },
          responsable: { type: 'string' },
        },
      },
    },
  },
};

const ESTADOS_VALIDOS = ['pendiente', 'en_progreso', 'completada', 'bloqueada'];

export default function SincronizacionDatos() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [fuente, setFuente] = useState('csv');
  const [archivo, setArchivo] = useState(null);
  const [extrayendo, setExtrayendo] = useState(false);
  const [filas, setFilas] = useState([]);
  const [error, setError] = useState('');
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      const pvs = await base44.entities.ProyectoObra.list('-created_date', 20);
      setProyectos(pvs);
      if (pvs[0]) setProyectoId(pvs[0].id);
    })();
  }, []);

  const procesarArchivo = async (file) => {
    if (!file) return;
    setArchivo(file);
    setFilas([]);
    setError('');
    setResultado(null);
    setExtrayendo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: ESQUEMA,
      });
      if (res.status !== 'success') {
        setError(res.details || 'No se pudo interpretar el archivo.');
        return;
      }
      const data = Array.isArray(res.output) ? res.output : res.output?.partidas || [];
      const lista = Array.isArray(data) ? data : [];
      if (lista.length === 0) setError('El archivo no contiene filas reconocibles.');
      setFilas(lista);
    } finally {
      setExtrayendo(false);
    }
  };

  const importar = async () => {
    const proyecto = proyectos.find(p => p.id === proyectoId);
    if (!proyecto) return;
    const validas = filas.filter(f => f.nombre && String(f.nombre).trim());
    if (validas.length === 0) return;

    setImportando(true);
    try {
      const registros = validas.map(f => ({
        proyecto_id: proyecto.id,
        codigo: f.codigo ? String(f.codigo) : undefined,
        nombre: String(f.nombre).trim(),
        categoria: f.categoria ? String(f.categoria) : undefined,
        avance_programado: Number(f.avance_programado) || 0,
        avance_real: Number(f.avance_real) || 0,
        fecha_inicio_programada: f.fecha_inicio_programada || undefined,
        fecha_fin_programada: f.fecha_fin_programada || undefined,
        monto_contrato_usd: Number(f.monto_contrato_usd) || undefined,
        subcontratista: f.subcontratista ? String(f.subcontratista) : undefined,
        responsable: f.responsable ? String(f.responsable) : undefined,
        estado: ESTADOS_VALIDOS.includes(f.estado) ? f.estado : 'pendiente',
        fuente_dato: fuente,
      }));

      const creadas = await base44.entities.PartidaControl.bulkCreate(registros);
      const ahora = new Date().toISOString();
      await base44.entities.ProyectoObra.update(proyecto.id, {
        ultima_sincronizacion: ahora,
        herramienta_calidad: fuente,
      });
      setProyectos(prev => prev.map(p => p.id === proyecto.id ? { ...p, ultima_sincronizacion: ahora, herramienta_calidad: fuente } : p));
      setResultado({ ok: true, total: registros.length, omitidas: filas.length - validas.length });
      setFilas([]);
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = '';
      return creadas;
    } catch (e) {
      await base44.entities.AlertaSistema.create({
        proyecto_id: proyectoId,
        tipo: 'sincronizacion_falla',
        nivel: 'critica',
        titulo: 'Falla en sincronización de partidas',
        mensaje: `La carga masiva desde ${fuente.toUpperCase()} falló: ${e.message || 'error desconocido'}`,
        estado: 'activa',
        destinatario_rol: 'administrador',
      });
      setResultado({ ok: false, mensaje: e.message || 'Error al importar' });
    } finally {
      setImportando(false);
    }
  };

  const proyecto = proyectos.find(p => p.id === proyectoId);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P0 · INGESTA DE DATOS</div>
        <h1 className="text-xl font-bold text-white">Sincronización de Datos — Carga Masiva de Partidas</h1>
      </div>

      {proyectos.length === 0 ? (
        <OrionCard className="p-8 text-center">
          <Database className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
          <p className="text-slate-500 font-mono text-xs">CONFIGURA UN PROYECTO ANTES DE SINCRONIZAR</p>
        </OrionCard>
      ) : (
        <>
          <OrionCard className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Proyecto destino</label>
                <select value={proyectoId} onChange={e => setProyectoId(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm text-white font-mono"
                  style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                  {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Fuente de dato</label>
                <select value={fuente} onChange={e => setFuente(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm text-white font-mono"
                  style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                  {['nupav', 'agisoft', 'csv', 'manual'].map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {proyecto?.ultima_sincronizacion && (
              <div className="flex items-center gap-2 font-mono text-xs" style={{ color: '#4A6FA5' }}>
                <Clock className="w-3 h-3" />
                ÚLTIMA SINCRONIZACIÓN: {new Date(proyecto.ultima_sincronizacion).toLocaleString('es-CL')}
              </div>
            )}

            <label className="block cursor-pointer rounded-lg p-8 text-center transition-colors hover:bg-white/[0.02]"
              style={{ border: '1px dashed #1E2D4A', background: '#0A1628' }}>
              <input ref={inputRef} type="file" accept=".csv,.xlsx,.json" className="hidden"
                onChange={e => procesarArchivo(e.target.files?.[0])} />
              {extrayendo ? (
                <>
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: '#003399' }} />
                  <div className="font-mono text-xs" style={{ color: '#4A6FA5' }}>EXTRAYENDO DATOS DEL ARCHIVO...</div>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mx-auto mb-3" style={{ color: '#4A6FA5' }} />
                  <div className="text-sm text-white mb-1">{archivo ? archivo.name : 'Cargar archivo de partidas'}</div>
                  <div className="font-mono text-[11px]" style={{ color: '#4A6FA5' }}>CSV · XLSX · JSON</div>
                </>
              )}
            </label>

            <div className="flex items-start gap-2 font-mono text-[11px]" style={{ color: '#4A6FA5' }}>
              <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Columnas reconocidas: codigo, nombre, categoria, avance_programado, avance_real, fecha_inicio_programada, fecha_fin_programada, monto_contrato_usd, subcontratista, responsable.</span>
            </div>
          </OrionCard>

          {error && (
            <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: 'rgba(211,84,0,0.08)', border: '1px solid rgba(211,84,0,0.3)' }}>
              <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#D35400' }} />
              <span className="text-sm" style={{ color: '#D35400' }}>{error}</span>
            </div>
          )}

          {resultado && (
            <div className="rounded-lg p-3 flex items-center gap-3"
              style={resultado.ok
                ? { background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.3)' }
                : { background: 'rgba(211,84,0,0.08)', border: '1px solid rgba(211,84,0,0.3)' }}>
              {resultado.ok
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#27AE60' }} />
                : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#D35400' }} />}
              <span className="text-sm" style={{ color: resultado.ok ? '#27AE60' : '#D35400' }}>
                {resultado.ok
                  ? `${resultado.total} partida(s) importada(s) correctamente${resultado.omitidas ? ` · ${resultado.omitidas} fila(s) omitida(s) sin nombre` : ''}. La detección de desviaciones se ejecuta automáticamente.`
                  : `Falló la importación: ${resultado.mensaje}. Se generó una alerta crítica de sincronización.`}
              </span>
            </div>
          )}

          {filas.length > 0 && (
            <>
              <PreviewPartidas filas={filas} />
              <div className="flex gap-2">
                <button onClick={importar} disabled={importando}
                  className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: '#003399' }}>
                  {importando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {importando ? 'Importando...' : `Importar ${filas.filter(f => f.nombre).length} partidas`}
                </button>
                <button onClick={() => { setFilas([]); setArchivo(null); if (inputRef.current) inputRef.current.value = ''; }}
                  className="px-4 py-2 rounded text-sm font-medium text-slate-400 hover:text-white"
                  style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                  Descartar
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}