import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Camera, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import { gravedadColor, formatFecha } from '@/lib/orionUtils';

export default function QATerreno() {
  const [inspecciones, setInspecciones] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [form, setForm] = useState({
    partida_id: '', tipo: 'checklist', gravedad: 'leve', descripcion: '',
    responsable: '', inspector: '', es_no_conformidad: false, pilar: 'procesos',
    fecha_limite_cierre: '', observacion: ''
  });
  const [cerrando, setCerrando] = useState(null);
  const [evidencia, setEvidencia] = useState('');

  useEffect(() => {
    const load = async () => {
      const [insp, pts, pvs] = await Promise.all([
        base44.entities.InspeccionCalidad.list('-created_date', 100),
        base44.entities.PartidaControl.list('-created_date', 100),
        base44.entities.ProyectoObra.list('-created_date', 5),
      ]);
      setInspecciones(insp);
      setPartidas(pts);
      setProyectos(pvs);
      setLoading(false);
    };
    load();
  }, []);

  const crear = async () => {
    const proyecto = proyectos[0];
    if (!proyecto) return;
    const num = `NC-${String(inspecciones.length + 1).padStart(4, '0')}`;
    const nueva = await base44.entities.InspeccionCalidad.create({
      ...form, proyecto_id: proyecto.id,
      numero_correlativo: num,
      estado: 'abierta',
    });
    setInspecciones(prev => [nueva, ...prev]);
    // Si es NC, bloquear partida
    if (form.es_no_conformidad && form.partida_id) {
      await base44.entities.PartidaControl.update(form.partida_id, {
        estado_calidad: 'rechazado', estado_pago: 'bloqueado'
      });
    }
    setShowForm(false);
    setForm({ partida_id: '', tipo: 'checklist', gravedad: 'leve', descripcion: '', responsable: '', inspector: '', es_no_conformidad: false, pilar: 'procesos', fecha_limite_cierre: '', observacion: '' });
  };

  const cerrarInspeccion = async (id) => {
    if (!evidencia.trim()) return;
    await base44.entities.InspeccionCalidad.update(id, {
      estado: 'cerrada',
      fecha_cierre_real: new Date().toISOString().split('T')[0],
      evidencia_cierre_url: evidencia,
    });
    setInspecciones(prev => prev.map(i => i.id === id ? { ...i, estado: 'cerrada', evidencia_cierre_url: evidencia } : i));
    setCerrando(null);
    setEvidencia('');
  };

  const aprobar = async (id) => {
    await base44.entities.InspeccionCalidad.update(id, { estado: 'aprobada' });
    setInspecciones(prev => prev.map(i => i.id === id ? { ...i, estado: 'aprobada' } : i));
  };

  const rechazar = async (id) => {
    await base44.entities.InspeccionCalidad.update(id, { estado: 'rechazada', es_no_conformidad: true });
    setInspecciones(prev => prev.map(i => i.id === id ? { ...i, estado: 'rechazada', es_no_conformidad: true } : i));
  };

  const filtradas = filtroEstado === 'todas' ? inspecciones :
    filtroEstado === 'nc' ? inspecciones.filter(i => i.es_no_conformidad) :
    inspecciones.filter(i => i.estado === filtroEstado);

  const nc_abiertas = inspecciones.filter(i => i.es_no_conformidad && ['abierta', 'en_revision'].includes(i.estado)).length;

  const estadoIcon = (estado) => {
    if (['aprobada', 'cerrada'].includes(estado)) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (['rechazada'].includes(estado)) return <XCircle className="w-4 h-4 text-orange-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P0 · ASISTIDO</div>
          <h1 className="text-xl font-bold text-white">Control de Calidad Digital · QA Terreno</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white"
          style={{ background: '#003399' }}
        >
          <Plus className="w-4 h-4" /> Registrar Inspección
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL INSPECCIONES', value: inspecciones.length, color: '#4A6FA5' },
          { label: 'NC ABIERTAS', value: nc_abiertas, color: nc_abiertas > 0 ? '#D35400' : '#27AE60' },
          { label: 'APROBADAS', value: inspecciones.filter(i => i.estado === 'aprobada').length, color: '#27AE60' },
          { label: 'RECHAZADAS', value: inspecciones.filter(i => i.estado === 'rechazada').length, color: '#D35400' },
        ].map(s => (
          <OrionCard key={s.label} className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#4A6FA5' }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </OrionCard>
        ))}
      </div>

      {nc_abiertas > 0 && (
        <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: 'rgba(211,84,0,0.08)', border: '1px solid rgba(211,84,0,0.35)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D35400' }} />
          <div className="text-sm" style={{ color: '#D35400' }}>
            <strong>REGLA ADN:</strong> {nc_abiertas} no-conformidades abiertas bloquean estados de pago asociados. Cerrar con evidencia fotográfica.
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'abierta', label: 'Abiertas' },
          { key: 'nc', label: `NC (${nc_abiertas})` },
          { key: 'aprobada', label: 'Aprobadas' },
          { key: 'cerrada', label: 'Cerradas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltroEstado(f.key)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${filtroEstado === f.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={filtroEstado === f.key ? { background: '#003399' } : { background: '#0D1526', border: '1px solid #1E2D4A' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <OrionCard className="p-5">
          <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>REGISTRO INSPECCIÓN DE CALIDAD</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Partida</label>
              <select
                value={form.partida_id}
                onChange={e => setForm(p => ({ ...p, partida_id: e.target.value }))}
                className="w-full px-3 py-2 rounded text-sm text-white font-mono"
                style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
              >
                <option value="">Seleccionar partida...</option>
                {partidas.map(p => <option key={p.id} value={p.id}>{p.codigo ? `[${p.codigo}] ` : ''}{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Tipo</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                {['checklist', 'foto', 'nota_voz', 'inspeccion_formal'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Gravedad</label>
              <select value={form.gravedad} onChange={e => setForm(p => ({ ...p, gravedad: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                {['leve', 'moderada', 'critica'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Pilar</label>
              <select value={form.pilar} onChange={e => setForm(p => ({ ...p, pilar: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                {['procesos', 'personas', 'tecnologia'].map(pi => <option key={pi} value={pi}>{pi}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Inspector</label>
              <input value={form.inspector} onChange={e => setForm(p => ({ ...p, inspector: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} placeholder="Nombre inspector" />
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Responsable</label>
              <input value={form.responsable} onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} placeholder="Responsable cierre" />
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Fecha Límite Cierre</label>
              <input type="date" value={form.fecha_limite_cierre} onChange={e => setForm(p => ({ ...p, fecha_limite_cierre: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="nc" checked={form.es_no_conformidad} onChange={e => setForm(p => ({ ...p, es_no_conformidad: e.target.checked }))} className="w-4 h-4 rounded" />
              <label htmlFor="nc" className="text-sm font-mono" style={{ color: '#D35400' }}>Es No-Conformidad (bloquea pago)</label>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Descripción / Observación</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded text-sm text-white font-mono resize-none"
                style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
                placeholder="Describe el hallazgo de calidad..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={crear} className="px-4 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
              Registrar Inspección
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-sm font-medium text-slate-400 hover:text-white" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
              Cancelar
            </button>
          </div>
        </OrionCard>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {loading ? (
          <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO INSPECCIONES...</OrionCard>
        ) : filtradas.length === 0 ? (
          <OrionCard className="p-8 text-center">
            <Camera className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-slate-500 font-mono text-xs">SIN REGISTROS</p>
          </OrionCard>
        ) : (
          filtradas.map(insp => {
            const partida = partidas.find(p => p.id === insp.partida_id);
            return (
              <OrionCard key={insp.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">{estadoIcon(insp.estado)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-white">{insp.numero_correlativo || '—'}</span>
                        {insp.es_no_conformidad && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-orange-600/10 text-orange-400 border-orange-500/30">NC</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${gravedadColor(insp.gravedad)}`}>
                          {insp.gravedad?.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-slate-500/10 text-slate-400 border-slate-500/30">
                          {insp.tipo?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-white mb-1">{insp.descripcion || insp.observacion || 'Sin descripción'}</div>
                      <div className="text-xs space-y-0.5" style={{ color: '#4A6FA5' }}>
                        {partida && <span>Partida: {partida.nombre} · </span>}
                        {insp.inspector && <span>Inspector: {insp.inspector} · </span>}
                        {insp.responsable && <span>Responsable: {insp.responsable}</span>}
                        {insp.fecha_limite_cierre && (
                          <span className="ml-1">· Cierre: {formatFecha(insp.fecha_limite_cierre)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      insp.estado === 'aprobada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      insp.estado === 'rechazada' ? 'bg-orange-600/10 text-orange-400 border-orange-500/30' :
                      insp.estado === 'cerrada' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {insp.estado?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Acciones según estado */}
                {['abierta', 'en_revision'].includes(insp.estado) && (
                  <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{ borderTop: '1px solid #1E2D4A' }}>
                    <button onClick={() => aprobar(insp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-white flex items-center gap-1" style={{ background: '#27AE60' }}>
                      <CheckCircle className="w-3 h-3" /> Aprobar
                    </button>
                    <button onClick={() => rechazar(insp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-orange-400 flex items-center gap-1" style={{ background: 'rgba(211,84,0,0.15)', border: '1px solid rgba(211,84,0,0.3)' }}>
                      <XCircle className="w-3 h-3" /> Rechazar (NC)
                    </button>
                    <button onClick={() => setCerrando(insp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 flex items-center gap-1" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                      Cerrar con evidencia
                    </button>
                  </div>
                )}

                {cerrando === insp.id && (
                  <div className="mt-3 flex gap-2" style={{ borderTop: '1px solid #1E2D4A', paddingTop: '12px' }}>
                    <input
                      value={evidencia}
                      onChange={e => setEvidencia(e.target.value)}
                      placeholder="URL de evidencia fotográfica (requerida)"
                      className="flex-1 px-3 py-1.5 rounded text-xs font-mono text-white"
                      style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
                    />
                    <button onClick={() => cerrarInspeccion(insp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-white" style={{ background: '#003399' }}>
                      Registrar Cierre
                    </button>
                    <button onClick={() => setCerrando(null)} className="px-2 py-1.5 rounded text-xs font-mono text-slate-400" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>✕</button>
                  </div>
                )}
              </OrionCard>
            );
          })
        )}
      </div>
    </div>
  );
}