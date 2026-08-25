import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Settings, Plus, CheckCircle, Upload, Building2, Rocket } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import WhatsAppConnect from '@/components/agent/WhatsAppConnect';
import GestionEquipo from '@/components/onboarding/GestionEquipo';

const CHECKLIST_ITEMS = [
  { key: 'nombre', label: 'Nombre de obra configurado' },
  { key: 'herramienta_calidad', label: 'Herramienta de calidad activa' },
  { key: 'administrador', label: 'Administrador de obra asignado' },
  { key: 'jefe_terreno', label: 'Jefe de terreno asignado' },
  { key: 'presupuesto_total_usd', label: 'Presupuesto total cargado' },
  { key: 'mandante', label: 'Mandante registrado' },
  { key: 'fecha_inicio', label: 'Fecha de inicio definida' },
  { key: 'fecha_fin_programada', label: 'Fecha fin programada' },
];

export default function Configuracion() {
  const [proyectos, setProyectos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    nombre: '', codigo: '', mandante: '', administrador: '', jefe_terreno: '',
    presupuesto_total_usd: 0, avance_programado: 0, umbral_desviacion: 5,
    herramienta_calidad: 'csv', fecha_inicio: '', fecha_fin_programada: '', descripcion: ''
  });

  useEffect(() => {
    base44.entities.ProyectoObra.list('-created_date', 10).then(pvs => {
      setProyectos(pvs);
      if (pvs.length > 0) setEditando(pvs[0]);
      setLoading(false);
    });
  }, []);

  const guardar = async () => {
    setGuardando(true);
    try {
      const completitud = CHECKLIST_ITEMS.filter(item => editando?.[item.key]).length;
      const pct = Math.round((completitud / CHECKLIST_ITEMS.length) * 100);
      const updated = await base44.entities.ProyectoObra.update(editando.id, {
        ...editando,
        checklist_completitud: pct,
        estado: pct >= 80 ? 'activo' : 'configuracion',
        ultima_sincronizacion: new Date().toISOString(),
      });
      setProyectos(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditando(updated);
    } finally {
      setGuardando(false);
    }
  };

  const crear = async () => {
    setGuardando(true);
    try {
      const completitud = CHECKLIST_ITEMS.filter(item => form[item.key]).length;
      const pct = Math.round((completitud / CHECKLIST_ITEMS.length) * 100);
      const nuevo = await base44.entities.ProyectoObra.create({
        ...form,
        checklist_completitud: pct,
        estado: pct >= 80 ? 'activo' : 'configuracion',
        ultima_sincronizacion: new Date().toISOString(),
      });
      setProyectos(prev => [nuevo, ...prev]);
      setEditando(nuevo);
      setShowNew(false);
    } finally {
      setGuardando(false);
    }
  };

  const completitud = editando ? CHECKLIST_ITEMS.filter(item => editando[item.key]).length : 0;
  const pctCompletitud = Math.round((completitud / CHECKLIST_ITEMS.length) * 100);

  const Field = ({ label, field, type = 'text', options }) => (
    <div>
      <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>{label}</label>
      {options ? (
        <select
          value={editando?.[field] || ''}
          onChange={e => setEditando(prev => ({ ...prev, [field]: e.target.value }))}
          className="w-full px-3 py-2 rounded text-sm text-white font-mono"
          style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={editando?.[field] || ''}
          onChange={e => setEditando(prev => ({ ...prev, [field]: type === 'number' ? +e.target.value : e.target.value }))}
          className="w-full px-3 py-2 rounded text-sm text-white font-mono"
          style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
        />
      )}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P2 · ASISTIDO</div>
          <h1 className="text-xl font-bold text-white">Motor de Onboarding de Obra Piloto</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/onboarding" className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-slate-300" style={{ background: '#0D1526', border: '1px solid #1E2D4A' }}>
            <Rocket className="w-4 h-4" /> Incorporar Empresa
          </Link>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
            <Plus className="w-4 h-4" /> Nueva Obra
          </button>
        </div>
      </div>

      <WhatsAppConnect />

      <GestionEquipo />

      {/* Selector de obra */}
      {proyectos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {proyectos.map(p => (
            <button
              key={p.id}
              onClick={() => setEditando(p)}
              className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-colors ${editando?.id === p.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              style={editando?.id === p.id ? { background: '#003399' } : { background: '#0D1526', border: '1px solid #1E2D4A' }}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Nueva obra form */}
      {showNew && (
        <OrionCard className="p-5">
          <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>CONFIGURAR NUEVA OBRA</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { key: 'nombre', label: 'Nombre de Obra *', type: 'text' },
              { key: 'codigo', label: 'Código Interno', type: 'text' },
              { key: 'mandante', label: 'Mandante', type: 'text' },
              { key: 'administrador', label: 'Administrador de Obra', type: 'text' },
              { key: 'jefe_terreno', label: 'Jefe de Terreno', type: 'text' },
              { key: 'presupuesto_total_usd', label: 'Presupuesto Total (USD)', type: 'number' },
              { key: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
              { key: 'fecha_fin_programada', label: 'Fecha Fin Programada', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }} />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={crear} disabled={guardando} className="px-4 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
              {guardando ? 'Creando...' : 'Crear Obra'}
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded text-sm font-medium text-slate-400" style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>Cancelar</button>
          </div>
        </OrionCard>
      )}

      {loading ? (
        <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO...</OrionCard>
      ) : !editando ? (
        <OrionCard className="p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-400" />
          <p className="text-white font-semibold mb-2">Sin obras configuradas</p>
          <p className="text-sm mb-4" style={{ color: '#4A6FA5' }}>Crea la primera obra para activar el Centro de Comando.</p>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded text-sm font-medium text-white" style={{ background: '#003399' }}>
            + Nueva Obra
          </button>
        </OrionCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Checklist */}
          <OrionCard className="p-5">
            <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>COMPLETITUD DE CONFIGURACIÓN</div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-sm text-white font-bold">{pctCompletitud}%</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  pctCompletitud >= 80
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {pctCompletitud >= 80 ? 'OPERATIVA' : 'EN CONFIG.'}
                </span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: '#0A1628' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${pctCompletitud}%`,
                    background: pctCompletitud >= 80 ? '#27AE60' : pctCompletitud >= 50 ? '#F39C12' : '#D35400'
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: '#4A6FA5' }}>
                Mínimo 80% requerido para activar módulos.
              </p>
            </div>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map(item => {
                const ok = !!editando?.[item.key];
                return (
                  <div key={item.key} className="flex items-center gap-2 text-xs">
                    {ok
                      ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                      : <div className="w-3.5 h-3.5 rounded-full border flex-shrink-0" style={{ borderColor: '#D35400' }} />
                    }
                    <span style={{ color: ok ? '#fff' : '#4A6FA5' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </OrionCard>

          {/* Configuración */}
          <div className="lg:col-span-2 space-y-4">
            <OrionCard className="p-5">
              <div className="font-mono text-xs mb-4 uppercase" style={{ color: '#4A6FA5' }}>DATOS DE LA OBRA</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nombre de Obra" field="nombre" />
                <Field label="Código Interno" field="codigo" />
                <Field label="Mandante" field="mandante" />
                <Field label="Administrador de Obra" field="administrador" />
                <Field label="Jefe de Terreno" field="jefe_terreno" />
                <Field label="Presupuesto Total (USD)" field="presupuesto_total_usd" type="number" />
                <Field label="Avance Programado (%)" field="avance_programado" type="number" />
                <Field label="Umbral Desviación (%)" field="umbral_desviacion" type="number" />
                <Field label="Fecha Inicio" field="fecha_inicio" type="date" />
                <Field label="Fecha Fin Programada" field="fecha_fin_programada" type="date" />
                <Field label="Herramienta de Calidad" field="herramienta_calidad" options={[
                  { value: 'nupav', label: 'Nupav' },
                  { value: 'agisoft', label: 'Agisoft' },
                  { value: 'csv', label: 'CSV Programado (Fallback)' },
                  { value: 'manual', label: 'Captura Manual' },
                ]} />
                <Field label="Estado" field="estado" options={[
                  { value: 'configuracion', label: 'En Configuración' },
                  { value: 'activo', label: 'Activo' },
                  { value: 'pausado', label: 'Pausado' },
                  { value: 'cerrado', label: 'Cerrado' },
                ]} />
              </div>
              <div className="mt-3">
                <label className="text-xs font-mono mb-1 block" style={{ color: '#4A6FA5' }}>Descripción</label>
                <textarea
                  value={editando?.descripcion || ''}
                  onChange={e => setEditando(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded text-sm text-white font-mono resize-none"
                  style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}
                />
              </div>
              <div className="mt-4">
                <button onClick={guardar} disabled={guardando} className="px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2" style={{ background: '#003399' }}>
                  {guardando ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</> : <><CheckCircle className="w-4 h-4" />Guardar Configuración</>}
                </button>
              </div>
            </OrionCard>
          </div>
        </div>
      )}
    </div>
  );
}