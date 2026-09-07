import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Plus } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import SemaforoIndicator from '@/components/SemaforoIndicator';
import { calcularDesviacion, semaforo, bgSemaforo } from '@/lib/orionUtils';

export default function MonitorAvance() {
  const [partidas, setPartidas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editAvance, setEditAvance] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [nueva, setNueva] = useState({ nombre: '', codigo: '', avance_programado: 0, avance_real: 0, responsable: '', subcontratista: '' });

  useEffect(() => {
    const load = async () => {
      const [pvs, pts] = await Promise.all([
        base44.entities.ProyectoObra.list('-created_date', 10),
        base44.entities.PartidaControl.list('-created_date', 100),
      ]);
      setProyectos(pvs);
      setPartidas(pts);
      if (pvs.length > 0) setProyectoId(pvs[0].id);
      setLoading(false);
    };
    load();
  }, []);

  const partidasFiltradas = partidas.filter(p => {
    if (proyectoId && p.proyecto_id !== proyectoId) return false;
    if (filtro === 'desviadas') return calcularDesviacion(p.avance_real, p.avance_programado) > 5;
    if (filtro === 'ok') return calcularDesviacion(p.avance_real, p.avance_programado) <= 5;
    return true;
  });

  const saveAvance = async (id) => {
    await base44.entities.PartidaControl.update(id, { avance_real: parseFloat(editAvance) });
    setPartidas(prev => prev.map(p => p.id === id ? { ...p, avance_real: parseFloat(editAvance) } : p));
    setEditingId(null);
  };

  const crearPartida = async () => {
    const p = await base44.entities.PartidaControl.create({ ...nueva, proyecto_id: proyectoId });
    setPartidas(prev => [p, ...prev]);
    setShowForm(false);
    setNueva({ nombre: '', codigo: '', avance_programado: 0, avance_real: 0, responsable: '', subcontratista: '' });
  };

  const desviadas = partidasFiltradas.filter(p => calcularDesviacion(p.avance_real, p.avance_programado) > 5);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P0 · AUTÓNOMO</div>
          <h1 className="text-xl font-bold text-white">Monitor de Avance vs. Programa</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white"
          style={{ background: '#003399' }}
        >
          <Plus className="w-4 h-4" /> Nueva Partida
        </button>
      </div>

      {desviadas.length > 0 && (
        <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: 'rgba(211,84,0,0.1)', border: '1px solid rgba(211,84,0,0.4)' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#D35400' }} />
          <span className="text-sm" style={{ color: '#D35400' }}>
            <strong>{desviadas.length}</strong> partidas con desviación &gt;5% — Escalamiento automático a Gerencia Media activado.
          </span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'desviadas', label: `Desviadas (${partidas.filter(p => calcularDesviacion(p.avance_real, p.avance_programado) > 5).length})` },
          { key: 'ok', label: 'En programa' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filtro === f.key ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
            style={filtro === f.key ? { background: '#003399' } : { background: '#0D1526', border: '1px solid #1E2D4A' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Form nueva partida */}
      {showForm && (
        <OrionCard className="p-5">
          <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>NUEVA PARTIDA</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {[
              { key: 'codigo', label: 'Código', type: 'text' },
              { key: 'nombre', label: 'Nombre Partida', type: 'text' },
              { key: 'responsable', label: 'Responsable', type: 'text' },
              { key: 'subcontratista', label: 'Subcontratista', type: 'text' },
              { key: 'avance_programado', label: 'Avance Programado (%)', type: 'number' },
              { key: 'avance_real', label: 'Avance Real (%)', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={nueva[f.key]}
                  onChange={e => setNueva(prev => ({ ...prev, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
                  className="w-full px-3 py-2 rounded text-sm text-white font-mono"
                  style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={crearPartida} className="px-4 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
              Registrar Partida
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-sm font-medium text-slate-400 hover:text-white" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
              Cancelar
            </button>
          </div>
        </OrionCard>
      )}

      {/* Tabla */}
      <OrionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2D4A' }}>
                {['Estado', 'Código', 'Partida', 'Real', 'Prog.', 'Desviación', 'Responsable', 'Calidad', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider" style={{ color: '#4A6FA5' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-slate-500">Cargando partidas...</td></tr>
              ) : partidasFiltradas.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-slate-500 font-mono text-xs">SIN DATOS · Registre partidas</td></tr>
              ) : (
                partidasFiltradas.map(p => {
                  const desv = calcularDesviacion(p.avance_real, p.avance_programado);
                  const sem = semaforo(desv);
                  return (
                    <tr key={p.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid #0F1D35' }}>
                      <td className="px-4 py-3">
                        <SemaforoIndicator color={sem} size="md" />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.codigo || '—'}</td>
                      <td className="px-4 py-3 text-white font-medium max-w-48 truncate">{p.nombre}</td>
                      <td className="px-4 py-3">
                        {editingId === p.id ? (
                          <input
                            type="number"
                            value={editAvance}
                            onChange={e => setEditAvance(e.target.value)}
                            className="w-16 px-2 py-1 rounded text-xs font-mono text-white"
                            style={{ background: '#0A1628', border: '1px solid #003399' }}
                            min={0} max={100}
                          />
                        ) : (
                          <span className="font-mono text-white font-semibold">{p.avance_real || 0}%</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.avance_programado || 0}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${bgSemaforo(sem)}`}>
                          {desv > 0 ? `+${desv.toFixed(1)}%` : `${desv.toFixed(1)}%`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{p.responsable || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          p.estado_calidad === 'aprobado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          p.estado_calidad === 'rechazado' ? 'bg-orange-600/10 text-orange-400 border-orange-500/30' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          {p.estado_calidad?.replace('_', ' ').toUpperCase() || 'SIN QA'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === p.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => saveAvance(p.id)} className="px-2 py-1 rounded text-[10px] font-mono text-white" style={{ background: '#27AE60' }}>
                              OK
                            </button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 rounded text-[10px] font-mono text-slate-400" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(p.id); setEditAvance(String(p.avance_real || 0)); }}
                            className="px-2 py-1 rounded text-[10px] font-mono text-slate-400 hover:text-white transition-colors"
                            style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
                          >
                            ACTUALIZAR
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </OrionCard>
    </div>
  );
}