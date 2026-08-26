import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import TablaDemo from '@/components/demo/TablaDemo';

const SEMAFORO = { critica: 'hsl(var(--danger))', advertencia: 'hsl(var(--warn))', info: 'hsl(var(--info))' };
const usd = (n) => `$${Math.round(n || 0).toLocaleString('es-CL')}`;

// MODO 2 · DEMO: la obra BES-2026-01 en solo lectura. Ninguna acción se ejecuta.
export default function Demo() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.functions.invoke('demoObra', {})
      .then(r => setData(r.data))
      .catch(() => setError('No pudimos cargar la obra demo. Inténtalo de nuevo en un momento.'));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base p-6">
        <div className="orion-panel p-6 max-w-md text-sm text-muted-foreground space-y-3">
          <p>{error}</p>
          <Link to="/" className="text-primary text-xs font-mono">← Volver</Link>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { proyecto, kpis } = data;
  const desviacion = proyecto.avance_programado
    ? ((proyecto.avance_programado - proyecto.avance_real) / proyecto.avance_programado) * 100 : 0;
  const color = desviacion > (proyecto.umbral_desviacion || 5) ? 'hsl(var(--danger))'
    : desviacion > 0 ? 'hsl(var(--warn))' : 'hsl(var(--ok))';

  const KPIS = [
    { label: 'NC ABIERTAS', valor: kpis.nc_abiertas },
    { label: 'RDIS PENDIENTES', valor: kpis.rdis_pendientes },
    { label: 'EDPS BLOQUEADOS', valor: kpis.edps_bloqueados },
    { label: 'RETENIDO', valor: usd(kpis.monto_bloqueado_usd) },
    { label: 'ALERTAS ACTIVAS', valor: kpis.alertas_activas },
    { label: 'DOCS INDEXADOS', valor: kpis.documentos_indexados },
  ];

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      {/* Badge de modo demo, persistente */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-2.5 border-b border-hairline bg-surface">
        <Link to="/" className="text-muted-foreground"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest bg-primary text-primary-foreground">
          <Lock className="w-3 h-3" /> MODO DEMO · SOLO LECTURA
        </span>
        <Link to="/register" className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold border border-hairline bg-surface-raised">
          Registrarse <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <Logo size="md" />

        <section className="orion-panel p-4 sm:p-5">
          <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1">{proyecto.codigo} · {proyecto.mandante}</div>
          <h1 className="text-xl font-semibold mb-3">{proyecto.nombre}</h1>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <span className="text-2xl font-semibold" style={{ color }}>{desviacion.toFixed(1)}%</span>
              <span className="ml-2 text-xs text-muted-foreground">desviación</span>
            </div>
            <div className="text-xs text-muted-foreground">
              avance real <span className="text-foreground font-semibold">{proyecto.avance_real}%</span> vs programado <span className="text-foreground font-semibold">{proyecto.avance_programado}%</span>
            </div>
            <div className="text-xs text-muted-foreground">
              presupuesto <span className="text-foreground font-semibold">{usd(proyecto.presupuesto_total_usd)}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {KPIS.map(k => (
            <div key={k.label} className="orion-panel px-3 py-3">
              <div className="text-lg font-semibold text-foreground">{k.valor}</div>
              <div className="text-[9px] font-mono tracking-wider text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>

        <section className="orion-panel overflow-hidden">
          <header className="px-4 py-2.5 border-b border-hairline">
            <span className="text-[11px] font-mono tracking-widest text-muted-foreground">ALERTAS ACTIVAS</span>
          </header>
          {data.alertas.length === 0 ? (
            <p className="px-4 py-4 text-xs text-muted-foreground">Sin alertas activas.</p>
          ) : data.alertas.map((a, i) => (
            <div key={i} className="px-4 py-3 border-b border-hairline/60 last:border-0"
              style={{ borderLeft: `3px solid ${SEMAFORO[a.nivel] || SEMAFORO.info}` }}>
              <div className="text-xs font-semibold text-foreground">{a.titulo}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{a.mensaje}</div>
            </div>
          ))}
        </section>

        <TablaDemo
          titulo="PARTIDAS"
          columnas={['CÓDIGO', 'PARTIDA', 'REAL', 'PROG.', 'CALIDAD', 'PAGO', 'SUBCONTRATO']}
          filas={data.partidas.map(p => [p.codigo, p.nombre, `${p.avance_real}%`, `${p.avance_programado}%`, p.estado_calidad, p.estado_pago, p.subcontratista || '—'])}
        />

        <TablaDemo
          titulo="ESTADOS DE PAGO"
          columnas={['EDP', 'SUBCONTRATO', 'MONTO', 'ESTADO', 'MOTIVO BLOQUEO']}
          filas={data.edps.map(e => [e.numero_edp || '—', e.subcontratista || '—', usd(e.monto_usd), e.estado, e.motivo_bloqueo || '—'])}
        />

        <TablaDemo
          titulo="RDIS"
          columnas={['N°', 'TÍTULO', 'ESTADO', 'PRIORIDAD', 'VENCE']}
          filas={data.rdis.map(r => [r.numero_rdi || '—', r.titulo, r.estado, r.prioridad, r.fecha_vencimiento || '—'])}
        />

        <TablaDemo
          titulo="INSPECCIONES Y NO CONFORMIDADES"
          columnas={['N°', 'DESCRIPCIÓN', 'GRAVEDAD', 'ESTADO', 'NC']}
          filas={data.inspecciones.map(i => [i.numero_correlativo || '—', i.descripcion || '—', i.gravedad, i.estado, i.es_no_conformidad ? 'Sí' : 'No'])}
        />

        <div className="orion-panel p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-xs text-muted-foreground flex-1">
            Esto mismo opera con tus EETT, tus partidas y tus subcontratistas. En el demo las acciones están bloqueadas.
          </p>
          <Link to="/register" className="px-5 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
            Registrar mi constructora
          </Link>
        </div>
      </div>
    </div>
  );
}