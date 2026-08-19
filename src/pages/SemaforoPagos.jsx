import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Plus, Lock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import { estadoPagoColor, formatFecha } from '@/lib/orionUtils';

export default function SemaforoPagos() {
  const [edps, setEdps] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [firmando, setFirmando] = useState(null);
  const [firmaNombre, setFirmaNombre] = useState('');
  const [form, setForm] = useState({
    partida_id: '', subcontratista: '', monto_usd: 0,
    porcentaje_avance: 0, observaciones: ''
  });

  useEffect(() => {
    const load = async () => {
      const [edpList, pts, pvs, insp] = await Promise.all([
        base44.entities.EstadoPago.list('-created_date', 100),
        base44.entities.PartidaControl.list('-created_date', 100),
        base44.entities.ProyectoObra.list('-created_date', 5),
        base44.entities.InspeccionCalidad.list('-created_date', 200),
      ]);
      setEdps(edpList);
      setPartidas(pts);
      setProyectos(pvs);
      setInspecciones(insp);
      setLoading(false);
    };
    load();
  }, []);

  const generarEDP = async () => {
    const proyecto = proyectos[0];
    if (!proyecto || !form.partida_id) return;

    const partida = partidas.find(p => p.id === form.partida_id);
    const nc_abiertas = inspecciones.filter(i =>
      i.partida_id === form.partida_id &&
      i.es_no_conformidad &&
      ['abierta', 'en_revision'].includes(i.estado)
    );

    const num = `EDP-${String(edps.length + 1).padStart(4, '0')}`;
    let estado = 'borrador';
    let motivo = '';

    if (nc_abiertas.length > 0) {
      estado = 'bloqueado_calidad';
      motivo = `${nc_abiertas.length} no-conformidades abiertas: ${nc_abiertas.map(n => n.numero_correlativo).join(', ')}`;
    } else if (partida?.estado_calidad !== 'aprobado') {
      estado = 'bloqueado_calidad';
      motivo = 'Calidad de partida no aprobada. Requiere inspección formal.';
    }

    const nuevo = await base44.entities.EstadoPago.create({
      ...form,
      proyecto_id: proyecto.id,
      numero_edp: num,
      estado,
      motivo_bloqueo: motivo,
      calidad_verificada: nc_abiertas.length === 0 && partida?.estado_calidad === 'aprobado',
      avance_verificado: (partida?.avance_real || 0) >= form.porcentaje_avance,
    });
    setEdps(prev => [nuevo, ...prev]);
    setShowForm(false);
    setForm({ partida_id: '', subcontratista: '', monto_usd: 0, porcentaje_avance: 0, observaciones: '' });
  };

  const firmar = async (id) => {
    if (!firmaNombre.trim()) return;
    await base44.entities.EstadoPago.update(id, {
      estado: 'pendiente_firma',
      administrador_firma: firmaNombre,
      fecha_firma: new Date().toISOString().split('T')[0],
    });
    setEdps(prev => prev.map(e => e.id === id ? { ...e, estado: 'pendiente_firma', administrador_firma: firmaNombre } : e));
    setFirmando(null);
    setFirmaNombre('');
  };

  const aprobar = async (id) => {
    await base44.entities.EstadoPago.update(id, { estado: 'aprobado' });
    setEdps(prev => prev.map(e => e.id === id ? { ...e, estado: 'aprobado' } : e));
  };

  const rechazar = async (id) => {
    await base44.entities.EstadoPago.update(id, { estado: 'rechazado' });
    setEdps(prev => prev.map(e => e.id === id ? { ...e, estado: 'rechazado' } : e));
  };

  const filtrados = edps.filter(e => {
    if (filtro === 'bloqueados') return e.estado === 'bloqueado_calidad';
    if (filtro === 'pendientes') return ['borrador', 'pendiente_firma'].includes(e.estado);
    if (filtro === 'aprobados') return ['aprobado', 'pagado'].includes(e.estado);
    return true;
  });

  const totalBloqueado = edps.filter(e => e.estado === 'bloqueado_calidad').reduce((s, e) => s + (e.monto_usd || 0), 0);
  const totalAprobado = edps.filter(e => ['aprobado', 'pagado'].includes(e.estado)).reduce((s, e) => s + (e.monto_usd || 0), 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P0 · ASISTIDO</div>
          <h1 className="text-xl font-bold text-white">Semáforo de Pagos y Subcontratos</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
          <Plus className="w-4 h-4" /> Generar EDP
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL EDPs', value: edps.length, color: '#4A6FA5' },
          { label: 'BLOQUEADOS', value: edps.filter(e => e.estado === 'bloqueado_calidad').length, color: '#D35400' },
          { label: 'MONTO BLOQUEADO', value: `$${totalBloqueado.toLocaleString()}`, color: '#D35400' },
          { label: 'APROBADO / PAGADO', value: `$${totalAprobado.toLocaleString()}`, color: '#27AE60' },
        ].map(s => (
          <OrionCard key={s.label} className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#4A6FA5' }}>{s.label}</div>
            <div className="text-xl font-bold truncate" style={{ color: s.color }}>{s.value}</div>
          </OrionCard>
        ))}
      </div>

      {edps.filter(e => e.estado === 'bloqueado_calidad').length > 0 && (
        <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: 'rgba(211,84,0,0.08)', border: '1px solid rgba(211,84,0,0.35)' }}>
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D35400' }} />
          <div className="text-sm" style={{ color: '#D35400' }}>
            <strong>REGLA ADN — NO QUALITY, NO PAY:</strong> {edps.filter(e => e.estado === 'bloqueado_calidad').length} EDP(s) bloqueados por no-conformidades de calidad abiertas. El sistema impide técnicamente generar cobros sobre partidas con NCs activas.
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'bloqueados', label: `Bloqueados (${edps.filter(e => e.estado === 'bloqueado_calidad').length})` },
          { key: 'pendientes', label: 'Pendientes' },
          { key: 'aprobados', label: 'Aprobados' },
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
          <div className="font-mono text-xs mb-1 uppercase" style={{ color: '#4A6FA5' }}>GENERAR ESTADO DE PAGO</div>
          <div className="text-xs mb-4" style={{ color: '#D35400' }}>
            ⚠ El sistema verificará automáticamente el estado de calidad de la partida antes de generar el EDP.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Partida *</label>
              <select value={form.partida_id} onChange={e => setForm(p => ({ ...p, partida_id: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                <option value="">Seleccionar partida...</option>
                {partidas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Subcontratista</label>
              <input value={form.subcontratista} onChange={e => setForm(p => ({ ...p, subcontratista: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Monto (USD)</label>
              <input type="number" value={form.monto_usd} onChange={e => setForm(p => ({ ...p, monto_usd: +e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>% Avance del Hito</label>
              <input type="number" value={form.porcentaje_avance} onChange={e => setForm(p => ({ ...p, porcentaje_avance: +e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} min={0} max={100} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Observaciones</label>
              <textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded text-sm text-white font-mono resize-none" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={generarEDP} className="px-4 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>Generar EDP</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-sm font-medium text-slate-400 hover:text-white" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>Cancelar</button>
          </div>
        </OrionCard>
      )}

      {/* Lista EDPs */}
      <div className="space-y-3">
        {loading ? (
          <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO...</OrionCard>
        ) : filtrados.length === 0 ? (
          <OrionCard className="p-8 text-center">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-slate-500 font-mono text-xs">SIN ESTADOS DE PAGO</p>
          </OrionCard>
        ) : (
          filtrados.map(edp => {
            const partida = partidas.find(p => p.id === edp.partida_id);
            const bloqueado = edp.estado === 'bloqueado_calidad';
            return (
              <OrionCard key={edp.id} className="p-4" style={bloqueado ? { borderColor: 'rgba(211,84,0,0.4)' } : {}}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {bloqueado ? <Lock className="w-5 h-5 text-orange-400" /> :
                       ['aprobado', 'pagado'].includes(edp.estado) ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                       <CreditCard className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-white">{edp.numero_edp || '—'}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${estadoPagoColor(edp.estado)}`}>
                          {edp.estado?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="font-mono text-sm font-bold text-white">${(edp.monto_usd || 0).toLocaleString()} USD</span>
                      </div>
                      <div className="text-sm text-slate-300">{partida?.nombre || 'Partida no encontrada'}</div>
                      <div className="text-xs mt-1 flex flex-wrap gap-x-3" style={{ color: '#4A6FA5' }}>
                        {edp.subcontratista && <span>Subcontratista: {edp.subcontratista}</span>}
                        <span>Avance hito: {edp.porcentaje_avance}%</span>
                        <span>Calidad: {edp.calidad_verificada ? '✓ Verificada' : '✗ Pendiente'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {bloqueado && edp.motivo_bloqueo && (
                  <div className="mb-3 p-3 rounded text-xs" style={{ background: 'rgba(211,84,0,0.08)', border: '1px solid rgba(211,84,0,0.25)' }}>
                    <div className="font-mono text-[10px] mb-1" style={{ color: '#D35400' }}>MOTIVO BLOQUEO:</div>
                    <div className="text-slate-300">{edp.motivo_bloqueo}</div>
                  </div>
                )}

                {edp.administrador_firma && (
                  <div className="text-xs font-mono" style={{ color: '#27AE60' }}>
                    ✓ Firmado por: {edp.administrador_firma} · {formatFecha(edp.fecha_firma)}
                  </div>
                )}

                {/* Acciones */}
                {edp.estado === 'borrador' && (
                  <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{ borderTop: '1px solid #1E2D4A' }}>
                    <button onClick={() => setFirmando(edp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-white flex items-center gap-1" style={{ background: '#003399' }}>
                      Enviar a firma
                    </button>
                    <button onClick={() => rechazar(edp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-orange-400" style={{ background: 'rgba(211,84,0,0.1)', border: '1px solid rgba(211,84,0,0.3)' }}>
                      Rechazar
                    </button>
                  </div>
                )}
                {edp.estado === 'pendiente_firma' && (
                  <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{ borderTop: '1px solid #1E2D4A' }}>
                    <button onClick={() => aprobar(edp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-white flex items-center gap-1" style={{ background: '#27AE60' }}>
                      <CheckCircle className="w-3 h-3" /> Aprobar EDP
                    </button>
                    <button onClick={() => rechazar(edp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-orange-400" style={{ background: 'rgba(211,84,0,0.1)', border: '1px solid rgba(211,84,0,0.3)' }}>
                      <XCircle className="w-3 h-3 inline mr-1" />Rechazar
                    </button>
                  </div>
                )}
                {firmando === edp.id && (
                  <div className="mt-3 flex gap-2" style={{ borderTop: '1px solid #1E2D4A', paddingTop: '12px' }}>
                    <input value={firmaNombre} onChange={e => setFirmaNombre(e.target.value)} placeholder="Nombre del administrador que firma" className="flex-1 px-3 py-1.5 rounded text-xs font-mono text-white" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
                    <button onClick={() => firmar(edp.id)} className="px-3 py-1.5 rounded text-xs font-mono text-white" style={{ background: '#003399' }}>Registrar Firma</button>
                    <button onClick={() => setFirmando(null)} className="px-2 rounded text-xs text-slate-400" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>✕</button>
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