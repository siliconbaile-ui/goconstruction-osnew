import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import { prioridadColor, formatFecha, bgSemaforo } from '@/lib/orionUtils';

export default function GestorRDI() {
  const [rdis, setRdis] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('activos');
  const [respondiendo, setRespondiendo] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [form, setForm] = useState({
    titulo: '', descripcion: '', partida_id: '', emisor: '',
    especialista_asignado: '', prioridad: 'media', categoria: 'otro',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    const load = async () => {
      const [rList, pts, pvs] = await Promise.all([
        base44.entities.RequerimientoInformacion.list('-created_date', 100),
        base44.entities.PartidaControl.list('-created_date', 100),
        base44.entities.ProyectoObra.list('-created_date', 5),
      ]);
      setRdis(rList);
      setPartidas(pts);
      setProyectos(pvs);
      setLoading(false);
    };
    load();
  }, []);

  const crearRDI = async () => {
    const proyecto = proyectos[0];
    if (!proyecto) return;
    const num = `RDI-${String(rdis.length + 1).padStart(4, '0')}`;
    const nuevo = await base44.entities.RequerimientoInformacion.create({
      ...form, proyecto_id: proyecto.id,
      numero_rdi: num,
      estado: 'abierto',
    });
    setRdis(prev => [nuevo, ...prev]);
    setShowForm(false);
    setForm({ titulo: '', descripcion: '', partida_id: '', emisor: '', especialista_asignado: '', prioridad: 'media', categoria: 'otro', fecha_vencimiento: '' });
  };

  const responder = async (id) => {
    if (!respuesta.trim()) return;
    await base44.entities.RequerimientoInformacion.update(id, {
      respuesta,
      estado: 'respondido',
      fecha_respuesta: new Date().toISOString().split('T')[0],
    });
    setRdis(prev => prev.map(r => r.id === id ? { ...r, respuesta, estado: 'respondido' } : r));
    setRespondiendo(null);
    setRespuesta('');
  };

  const cerrar = async (id) => {
    await base44.entities.RequerimientoInformacion.update(id, { estado: 'cerrado' });
    setRdis(prev => prev.map(r => r.id === id ? { ...r, estado: 'cerrado' } : r));
  };

  const filtrados = rdis.filter(r => {
    if (filtro === 'activos') return ['abierto', 'en_revision'].includes(r.estado);
    if (filtro === 'vencidos') return r.estado === 'vencido';
    if (filtro === 'respondidos') return ['respondido', 'cerrado'].includes(r.estado);
    return true;
  });

  const vencidos = rdis.filter(r => r.estado === 'vencido').length;
  const sinAsignar = rdis.filter(r => ['abierto', 'en_revision'].includes(r.estado) && !r.especialista_asignado).length;

  const isVencido = (fecha) => {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P0 · AUTÓNOMO</div>
          <h1 className="text-xl font-bold text-white">Gestor de RDI — Requerimientos de Información</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
          <Plus className="w-4 h-4" /> Nuevo RDI
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL RDIs', value: rdis.length, color: '#4A6FA5' },
          { label: 'ABIERTOS', value: rdis.filter(r => r.estado === 'abierto').length, color: '#003399' },
          { label: 'VENCIDOS', value: vencidos, color: vencidos > 0 ? '#D35400' : '#27AE60' },
          { label: 'SIN ASIGNAR', value: sinAsignar, color: sinAsignar > 0 ? '#F39C12' : '#27AE60' },
        ].map(s => (
          <OrionCard key={s.label} className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#4A6FA5' }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </OrionCard>
        ))}
      </div>

      {sinAsignar > 0 && (
        <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.3)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span className="text-sm text-amber-400">
            <strong>REGLA:</strong> {sinAsignar} RDI sin especialista asignado — Un RDI sin 'EspecialistaAsignado' no puede superar 2h.
          </span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'activos', label: `Activos (${rdis.filter(r => ['abierto', 'en_revision'].includes(r.estado)).length})` },
          { key: 'vencidos', label: `Vencidos (${vencidos})` },
          { key: 'respondidos', label: 'Cerrados' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${filtro === f.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={filtro === f.key ? { background: '#003399' } : { background: '#0D1526', border: '1px solid #1E2D4A' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <OrionCard className="p-5">
          <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>NUEVO REQUERIMIENTO DE INFORMACIÓN</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Título del RDI *</label>
              <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} placeholder="Ej: Consulta especificación enfierradura Eje 4-J" />
            </div>
            {[
              { key: 'emisor', label: 'Emisor' },
              { key: 'especialista_asignado', label: 'Especialista Asignado' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
              </div>
            ))}
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Prioridad</label>
              <select value={form.prioridad} onChange={e => setForm(p => ({ ...p, prioridad: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                {['baja', 'media', 'alta', 'critica'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Categoría</label>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                {['diseno', 'materiales', 'procedimiento', 'contrato', 'seguridad', 'otro'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Partida Asociada</label>
              <select value={form.partida_id} onChange={e => setForm(p => ({ ...p, partida_id: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                <option value="">Sin partida</option>
                {partidas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Fecha Vencimiento</label>
              <input type="date" value={form.fecha_vencimiento} onChange={e => setForm(p => ({ ...p, fecha_vencimiento: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded text-sm text-white font-mono resize-none" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} placeholder="Describe el requerimiento técnico..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={crearRDI} className="px-4 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>Registrar RDI</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-sm font-medium text-slate-400 hover:text-white" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>Cancelar</button>
          </div>
        </OrionCard>
      )}

      {/* Lista RDIs */}
      <div className="space-y-3">
        {loading ? (
          <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO RDIs...</OrionCard>
        ) : filtrados.length === 0 ? (
          <OrionCard className="p-8 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-slate-500 font-mono text-xs">SIN REQUERIMIENTOS</p>
          </OrionCard>
        ) : (
          filtrados.map(rdi => {
            const partida = partidas.find(p => p.id === rdi.partida_id);
            const vencido = isVencido(rdi.fecha_vencimiento) && ['abierto', 'en_revision'].includes(rdi.estado);
            return (
              <OrionCard key={rdi.id} className={`p-4 ${vencido ? '' : ''}`} style={vencido ? { borderColor: 'rgba(211,84,0,0.4)' } : {}}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-white">{rdi.numero_rdi || '—'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${prioridadColor(rdi.prioridad)}`}>
                        {rdi.prioridad?.toUpperCase()}
                      </span>
                      {vencido && <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-orange-600/10 text-orange-400 border-orange-500/30">VENCIDO</span>}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-slate-500/10 text-slate-400 border-slate-500/30">
                        {rdi.categoria?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-white">{rdi.titulo}</div>
                    {rdi.descripcion && <div className="text-xs mt-1 line-clamp-2" style={{ color: '#4A6FA5' }}>{rdi.descripcion}</div>}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex-shrink-0 ${
                    rdi.estado === 'cerrado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    rdi.estado === 'respondido' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    rdi.estado === 'vencido' ? 'bg-orange-600/10 text-orange-400 border-orange-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {rdi.estado?.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono" style={{ color: '#4A6FA5' }}>
                  {rdi.emisor && <span>Emisor: {rdi.emisor}</span>}
                  {rdi.especialista_asignado ? <span>Asignado: {rdi.especialista_asignado}</span> : <span className="text-amber-400">⚠ Sin asignar</span>}
                  {partida && <span>Partida: {partida.nombre}</span>}
                  {rdi.fecha_vencimiento && <span>Vence: {formatFecha(rdi.fecha_vencimiento)}</span>}
                </div>

                {rdi.respuesta && (
                  <div className="mt-3 p-3 rounded text-xs" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                    <div className="font-mono text-[10px] mb-1" style={{ color: '#27AE60' }}>RESPUESTA REGISTRADA:</div>
                    <div className="text-slate-300">{rdi.respuesta}</div>
                  </div>
                )}

                {['abierto', 'en_revision'].includes(rdi.estado) && (
                  <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{ borderTop: '1px solid #1E2D4A' }}>
                    <button onClick={() => setRespondiendo(rdi.id)} className="px-3 py-1.5 rounded text-xs font-mono text-white flex items-center gap-1" style={{ background: '#003399' }}>
                      <Zap className="w-3 h-3" /> Responder
                    </button>
                    <button onClick={() => cerrar(rdi.id)} className="px-3 py-1.5 rounded text-xs font-mono text-emerald-400 flex items-center gap-1" style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)' }}>
                      <CheckCircle className="w-3 h-3" /> Cerrar
                    </button>
                  </div>
                )}

                {respondiendo === rdi.id && (
                  <div className="mt-3" style={{ borderTop: '1px solid #1E2D4A', paddingTop: '12px' }}>
                    <textarea
                      value={respuesta}
                      onChange={e => setRespuesta(e.target.value)}
                      rows={3}
                      placeholder="Respuesta técnica documentada..."
                      className="w-full px-3 py-2 rounded text-xs font-mono text-white resize-none mb-2"
                      style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => responder(rdi.id)} className="px-3 py-1.5 rounded text-xs font-mono text-white" style={{ background: '#003399' }}>Registrar Respuesta</button>
                      <button onClick={() => setRespondiendo(null)} className="px-3 py-1.5 rounded text-xs font-mono text-slate-400" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>Cancelar</button>
                    </div>
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