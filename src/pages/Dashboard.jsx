import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import {
  TrendingUp, CheckSquare, CreditCard, FileText,
  AlertTriangle, ChevronRight, Clock, Zap
} from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import KPICard from '@/components/KPICard';
import SemaforoIndicator from '@/components/SemaforoIndicator';
import { calcularDesviacion, semaforo, formatTimestamp } from '@/lib/orionUtils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Colores de gráfico alineados a los tokens de marca (recharts requiere valores fijos).
const CHART = { primario: '#3B6FE8', ok: '#27AE60', grid: 'hsl(var(--hairline))' };
const SEMAFORO_HEX = { verde: 'hsl(var(--ok))', amarillo: 'hsl(var(--warn))', rojo: 'hsl(var(--danger))' };

export default function Dashboard() {
  const [proyecto, setProyecto] = useState(null);
  const [partidas, setPartidas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [rdis, setRdis] = useState([]);
  const [edps, setEdps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [proyectos, pts, alts, insp, rdiList, edpList] = await Promise.all([
          base44.entities.ProyectoObra.list('-created_date', 1),
          base44.entities.PartidaControl.list('-created_date', 50),
          base44.entities.AlertaSistema.filter({ estado: 'activa' }, '-created_date', 10),
          base44.entities.InspeccionCalidad.list('-created_date', 20),
          base44.entities.RequerimientoInformacion.list('-created_date', 20),
          base44.entities.EstadoPago.list('-created_date', 20),
        ]);
        setProyecto(proyectos[0] || null);
        setPartidas(pts);
        setAlertas(alts);
        setInspecciones(insp);
        setRdis(rdiList);
        setEdps(edpList);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const desviacion = proyecto ? calcularDesviacion(proyecto.avance_real || 0, proyecto.avance_programado || 0) : 0;
  const semaforoAvance = semaforo(desviacion);
  const nc_abiertas = inspecciones.filter(i => i.es_no_conformidad && ['abierta', 'en_revision'].includes(i.estado)).length;
  const rdi_abiertos = rdis.filter(r => ['abierto', 'en_revision'].includes(r.estado)).length;
  const edp_bloqueados = edps.filter(e => e.estado === 'bloqueado_calidad').length;
  const edp_aprobados = edps.filter(e => ['aprobado', 'pagado'].includes(e.estado)).length;
  const semaforoCalidad = nc_abiertas === 0 ? 'verde' : nc_abiertas <= 3 ? 'amarillo' : 'rojo';
  const semaforoPagos = edp_bloqueados === 0 ? 'verde' : edp_bloqueados <= 2 ? 'amarillo' : 'rojo';

  const chartData = partidas.slice(0, 8).map((p, i) => ({
    name: p.codigo || `P${i + 1}`,
    programado: p.avance_programado || 0,
    real: p.avance_real || 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs text-muted-foreground">SINCRONIZANDO GO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs mb-1 text-primary tracking-widest">
            DASHBOARD EJECUTIVO · GO
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">
            {proyecto?.nombre || 'Obra Piloto'}
          </h1>
          <div className="font-mono text-xs mt-1 text-muted-foreground">
            Última actualización: {formatTimestamp(proyecto?.ultima_sincronizacion || new Date().toISOString())}
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'AVANCE', color: semaforoAvance },
            { label: 'CALIDAD', color: semaforoCalidad },
            { label: 'PAGOS', color: semaforoPagos },
          ].map(({ label, color }) => (
            <div key={label} className="text-center">
              <SemaforoIndicator color={color} size="lg" />
              <div className="font-mono text-[9px] mt-1 text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas críticas */}
      {alertas.filter(a => a.nivel === 'critica').length > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3 border"
          style={{ background: 'hsl(var(--danger) / 0.08)', borderColor: 'hsl(var(--danger) / 0.35)' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--danger))' }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: 'hsl(var(--danger))' }}>
              {alertas.filter(a => a.nivel === 'critica').length} ALERTAS CRÍTICAS ACTIVAS
            </div>
            {alertas.filter(a => a.nivel === 'critica').slice(0, 2).map(a => (
              <div key={a.id} className="text-xs text-muted-foreground mt-1 truncate">{a.titulo}</div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="AVANCE REAL"
          value={`${(proyecto?.avance_real || 0).toFixed(1)}%`}
          sub={`Prog: ${(proyecto?.avance_programado || 0).toFixed(1)}%`}
          color="hsl(var(--primary))"
          icon={TrendingUp}
          trend={desviacion}
        />
        <KPICard
          label="NC ABIERTAS"
          value={nc_abiertas}
          sub={`${inspecciones.length} inspecciones totales`}
          color={nc_abiertas > 0 ? 'hsl(var(--danger))' : 'hsl(var(--ok))'}
          icon={CheckSquare}
        />
        <KPICard
          label="RDI ACTIVOS"
          value={rdi_abiertos}
          sub={`${rdis.length} RDIs totales`}
          color="hsl(var(--info))"
          icon={FileText}
        />
        <KPICard
          label="EDP BLOQUEADOS"
          value={edp_bloqueados}
          sub={`${edp_aprobados} aprobados`}
          color={edp_bloqueados > 0 ? 'hsl(var(--danger))' : 'hsl(var(--ok))'}
          icon={CreditCard}
        />
      </div>

      {/* Semáforo tripartito */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            label: 'MONITOR AVANCE',
            color: semaforoAvance,
            value: `${(proyecto?.avance_real || 0).toFixed(1)}%`,
            sub: desviacion > 0 ? `${desviacion.toFixed(1)}% desviación` : 'En programa',
            path: '/monitor-avance',
            icon: TrendingUp,
          },
          {
            label: 'CONTROL CALIDAD',
            color: semaforoCalidad,
            value: `${nc_abiertas} NC`,
            sub: nc_abiertas === 0 ? 'Sin no-conformidades' : 'No-conformidades abiertas',
            path: '/qa-terreno',
            icon: CheckSquare,
          },
          {
            label: 'SEMÁFORO PAGOS',
            color: semaforoPagos,
            value: `${edp_bloqueados} bloq.`,
            sub: edp_bloqueados === 0 ? 'Pagos sin bloqueos' : 'EDPs bloqueados por calidad',
            path: '/semaforo-pagos',
            icon: CreditCard,
          },
        ].map(({ label, color, value, sub, path, icon: Icon }) => (
          <Link key={path} to={path}>
            <OrionCard className="p-5 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-1 text-muted-foreground">
                    {label}
                  </div>
                  <div className="text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-xs mt-1 text-muted-foreground">{sub}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ background: SEMAFORO_HEX[color] || 'hsl(var(--info))', boxShadow: `0 0 12px ${SEMAFORO_HEX[color] || 'hsl(var(--info))'}` }}
                  />
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Ver detalle</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </OrionCard>
          </Link>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <OrionCard className="p-5">
          <div className="font-mono text-xs uppercase tracking-widest mb-4 text-muted-foreground">
            AVANCE POR PARTIDA — REAL vs PROGRAMADO
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART.primario} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART.primario} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART.ok} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART.ok} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--surface-1))', border: '1px solid hsl(var(--hairline))', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area type="monotone" dataKey="programado" stroke={CHART.primario} fill="url(#colorProg)" strokeWidth={2} name="Programado" />
              <Area type="monotone" dataKey="real" stroke={CHART.ok} fill="url(#colorReal)" strokeWidth={2} name="Real" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-0.5" style={{ background: CHART.primario }} />
              Programado
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-0.5" style={{ background: CHART.ok }} />
              Real
            </div>
          </div>
        </OrionCard>
      )}

      {/* Alertas recientes */}
      {alertas.length > 0 && (
        <OrionCard className="p-5">
          <div className="font-mono text-xs uppercase tracking-widest mb-4 text-muted-foreground">
            ALERTAS ACTIVAS · {alertas.length}
          </div>
          <div className="space-y-2">
            {alertas.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-hairline">
                <div className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                  style={a.nivel === 'critica'
                    ? { color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger) / 0.3)', background: 'hsl(var(--danger) / 0.1)' }
                    : a.nivel === 'advertencia'
                      ? { color: 'hsl(var(--warn))', borderColor: 'hsl(var(--warn) / 0.3)', background: 'hsl(var(--warn) / 0.1)' }
                      : { color: 'hsl(var(--info))', borderColor: 'hsl(var(--info) / 0.3)', background: 'hsl(var(--info) / 0.1)' }}>
                  {a.nivel.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{a.titulo}</div>
                  <div className="text-xs mt-0.5 line-clamp-1 text-muted-foreground">{a.mensaje}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono flex-shrink-0 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {a.horas_sin_respuesta || 0}h
                </div>
              </div>
            ))}
          </div>
        </OrionCard>
      )}

      {/* Empty state */}
      {!loading && partidas.length === 0 && (
        <OrionCard className="p-12 text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-20 text-primary" />
          <p className="text-foreground font-semibold mb-2">Sin datos de obra</p>
          <p className="text-sm text-muted-foreground">
            Configura la obra piloto para activar los módulos de GO.
          </p>
          <Link to="/configuracion" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground">
            Configurar obra <ChevronRight className="w-4 h-4" />
          </Link>
        </OrionCard>
      )}
    </div>
  );
}