import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import AlertaRow from '@/components/alertas/AlertaRow';
import { NIVEL_STYLE, ROL_LABEL } from '@/lib/alertaMeta';

const ESCALA_SIGUIENTE = {
  jefe_terreno: 'gerencia_media',
  gerencia_media: 'alta_direccion',
  alta_direccion: 'alta_direccion',
  administrador: 'gerencia_media',
};

export default function CentroAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [ejecutando, setEjecutando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('abiertas');
  const [filtroNivel, setFiltroNivel] = useState('todos');

  const cargar = async () => {
    const [as, pts] = await Promise.all([
      base44.entities.AlertaSistema.list('-created_date', 200),
      base44.entities.PartidaControl.list('-created_date', 200),
    ]);
    setAlertas(as);
    setPartidas(pts);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const horasDe = (a) => (Date.now() - new Date(a.created_date).getTime()) / 3600000;

  const actualizar = async (alerta, data) => {
    setBusyId(alerta.id);
    try {
      await base44.entities.AlertaSistema.update(alerta.id, data);
      setAlertas(prev => prev.map(a => a.id === alerta.id ? { ...a, ...data } : a));
    } finally {
      setBusyId(null);
    }
  };

  const escalar = async (alerta) => {
    const siguiente = ESCALA_SIGUIENTE[alerta.destinatario_rol] || 'gerencia_media';
    setBusyId(alerta.id);
    try {
      await base44.entities.AlertaSistema.update(alerta.id, { escalada: true, nivel: 'critica' });
      const nueva = await base44.entities.AlertaSistema.create({
        proyecto_id: alerta.proyecto_id,
        partida_id: alerta.partida_id,
        tipo: 'escalamiento',
        nivel: 'critica',
        titulo: `ESCALADA MANUAL · ${alerta.titulo}`,
        mensaje: `Escalada desde ${ROL_LABEL[alerta.destinatario_rol] || alerta.destinatario_rol} a ${ROL_LABEL[siguiente]}. ${alerta.mensaje || ''}`,
        estado: 'activa',
        destinatario_rol: siguiente,
        escalada: true,
        horas_sin_respuesta: Math.floor(horasDe(alerta)),
      });
      setAlertas(prev => [nueva, ...prev.map(a => a.id === alerta.id ? { ...a, escalada: true, nivel: 'critica' } : a)]);
    } finally {
      setBusyId(null);
    }
  };

  const ejecutarBarrido = async () => {
    setEjecutando(true);
    try {
      await base44.functions.invoke('escalarAlertasCriticas', {});
      await base44.functions.invoke('detectarRDIVencidos', {});
      await cargar();
    } finally {
      setEjecutando(false);
    }
  };

  const filtradas = useMemo(() => alertas.filter(a => {
    const okEstado =
      filtroEstado === 'todas' ? true :
      filtroEstado === 'abiertas' ? ['activa', 'reconocida'].includes(a.estado) :
      filtroEstado === 'resueltas' ? ['resuelta', 'archivada'].includes(a.estado) : true;
    const okNivel = filtroNivel === 'todos' || a.nivel === filtroNivel;
    return okEstado && okNivel;
  }), [alertas, filtroEstado, filtroNivel]);

  const abiertas = alertas.filter(a => ['activa', 'reconocida'].includes(a.estado));
  const criticas = abiertas.filter(a => a.nivel === 'critica').length;
  const stale = abiertas.filter(a => horasDe(a) >= 24).length;
  const escaladas = abiertas.filter(a => a.escalada).length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P0 · VIGILANCIA CONTINUA</div>
          <h1 className="text-xl font-bold text-white">Centro de Alertas — Escalamiento Jerárquico</h1>
        </div>
        <button onClick={ejecutarBarrido} disabled={ejecutando}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white disabled:opacity-50"
          style={{ background: '#003399' }}>
          {ejecutando ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {ejecutando ? 'Ejecutando barrido...' : 'Ejecutar barrido ahora'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'ABIERTAS', value: abiertas.length, color: abiertas.length > 0 ? '#F39C12' : '#27AE60' },
          { label: 'CRÍTICAS', value: criticas, color: criticas > 0 ? '#D35400' : '#27AE60' },
          { label: '>24H SIN RESPUESTA', value: stale, color: stale > 0 ? '#D35400' : '#27AE60' },
          { label: 'ESCALADAS', value: escaladas, color: escaladas > 0 ? '#003399' : '#4A6FA5' },
        ].map(s => (
          <OrionCard key={s.label} className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#4A6FA5' }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </OrionCard>
        ))}
      </div>

      {stale > 0 && (
        <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: 'rgba(211,84,0,0.08)', border: '1px solid rgba(211,84,0,0.3)' }}>
          <Bell className="w-4 h-4 flex-shrink-0" style={{ color: '#D35400' }} />
          <span className="text-sm" style={{ color: '#D35400' }}>
            <strong>REGLA DE ESCALAMIENTO:</strong> {stale} alerta(s) sin respuesta por más de 24h — el escalamiento automático las eleva al siguiente nivel jerárquico cada hora.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'abiertas', label: `Abiertas (${abiertas.length})` },
          { key: 'resueltas', label: 'Resueltas' },
          { key: 'todas', label: `Todas (${alertas.length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltroEstado(f.key)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${filtroEstado === f.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={filtroEstado === f.key ? { background: '#003399' } : { background: '#0D1526', border: '1px solid #1E2D4A' }}>
            {f.label}
          </button>
        ))}
        <div className="w-px mx-1" style={{ background: '#1E2D4A' }} />
        {['todos', 'critica', 'advertencia', 'info'].map(n => (
          <button key={n} onClick={() => setFiltroNivel(n)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${filtroNivel === n ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={filtroNivel === n
              ? { background: n === 'todos' ? '#003399' : NIVEL_STYLE[n].color }
              : { background: '#0D1526', border: '1px solid #1E2D4A' }}>
            {n === 'todos' ? 'Todos los niveles' : NIVEL_STYLE[n].label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO ALERTAS...</OrionCard>
        ) : filtradas.length === 0 ? (
          <OrionCard className="p-8 text-center">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: '#27AE60', opacity: 0.4 }} />
            <p className="text-slate-500 font-mono text-xs">SIN ALERTAS EN ESTE FILTRO · OPERACIÓN NORMAL</p>
          </OrionCard>
        ) : (
          filtradas.map(a => (
            <AlertaRow
              key={a.id}
              alerta={a}
              partida={partidas.find(p => p.id === a.partida_id)}
              horas={horasDe(a)}
              busy={busyId === a.id}
              onReconocer={(al) => actualizar(al, { estado: 'reconocida' })}
              onResolver={(al) => actualizar(al, { estado: 'resuelta' })}
              onArchivar={(al) => actualizar(al, { estado: 'archivada' })}
              onEscalar={escalar}
            />
          ))
        )}
      </div>
    </div>
  );
}