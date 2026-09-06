import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, FileText, PlayCircle } from 'lucide-react';
import Logo from '@/components/marca/Logo';

const AMBER = '#E8912E';

const FEATURES = [
  { icon: TrendingUp, title: 'Avance y Curva S', desc: 'Programado vs real, vigilia 24/7' },
  { icon: ShieldCheck, title: 'No Quality, No Pay', desc: 'NC crítica bloquea el pago' },
  { icon: FileText, title: 'RDIs e Indexación', desc: 'Cita la página exacta del EETT' },
];

// Columna izquierda · Blindaje de margen.
export default function PanelBlindaje({ data }) {
  const kpis = data?.kpis;
  const proyecto = data?.proyecto;

  const KPI_DATA = [
    { label: 'USD Retenidos', value: kpis ? `$${(kpis.monto_bloqueado_usd || 0).toLocaleString('es-CL')}` : '—', max: proyecto?.presupuesto_total_usd || 1, raw: kpis?.monto_bloqueado_usd || 0, color: AMBER },
    { label: 'NC Críticas', value: kpis?.nc_abiertas ?? '—', max: 10, raw: kpis?.nc_abiertas || 0, color: 'hsl(var(--danger))' },
    { label: 'Componentes Activos', value: data?.partidas?.length ?? '—', max: 20, raw: data?.partidas?.length || 0, color: 'hsl(var(--primary))' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 border-r border-hairline bg-surface-base/50 backdrop-blur-xl h-full overflow-y-auto">
      <div className="px-5 py-4 border-b border-hairline flex-shrink-0">
        <Logo tamano="sm" conBajada={false} />
        <h1 className="text-xl font-bold leading-tight text-foreground mt-3">El command center de tu obra.</h1>
        <p className="text-xs text-muted-foreground mt-1.5">Blindaje de margen operacional.</p>
      </div>

      <div className="px-4 py-3 space-y-2 flex-shrink-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Frentes operados</div>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass-card p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${AMBER}18`, color: AMBER }}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{title}</div>
              <div className="text-[11px] text-muted-foreground">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 space-y-2 border-t border-hairline flex-shrink-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">KPIs de alto impacto</div>
        {KPI_DATA.map(k => (
          <div key={k.label} className="glass-card p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">{k.label}</span>
              <span className="font-mono text-lg font-bold" style={{ color: k.color }}>{k.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (k.raw / k.max) * 100)}%`, background: k.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-4 mt-auto border-t border-hairline flex-shrink-0">
        <Link to="/demo" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: AMBER, color: '#fff' }}>
          <PlayCircle className="w-4 h-4" /> Operar Demo con Obra Real
        </Link>
      </div>
    </aside>
  );
}