import { Link } from 'react-router-dom';
import { TrendingUp, FileText, CreditCard, MessageCircle, ArrowRight } from 'lucide-react';

const AMBER = '#E8912E';

const KPIS = [
  { label: 'AVANCE', value: '58%', icon: TrendingUp, prompt: 'Preguntarle a GO por qué el avance está atrasado' },
  { label: 'RDI', value: '0', icon: FileText },
  { label: 'EDP', value: '0', icon: CreditCard },
];

const CONSULTAS_SUGERIDAS = [
  '¿Qué recubrimiento exige la EETT en losas a la intemperie?',
  'Muéstrame las 3 partidas en rojo que bloquean el pago.',
  'Generar un reporte de las NC críticas de hoy.',
];

// Columna derecha · Conversión y contexto de datos.
export default function PanelVistaPrevia({ alConsultar }) {
  return (
    <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 border-l border-hairline bg-surface-base h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-hairline">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Tu obra, en vivo
        </div>
        <div className="text-sm font-bold text-foreground mt-0.5">
          GoConstruction OS — Demo de Ventas
        </div>
        <div className="font-mono text-[10px] text-muted-foreground mt-1">
          3 partidas indexadas
        </div>
      </div>

      {/* KPIs conversacionales */}
      <div className="px-5 py-4 border-b border-hairline space-y-2.5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          KPIs conversacionales
        </div>
        {KPIS.map(k => (
          <div key={k.label} className="rounded-xl p-3 bg-surface-raised border border-hairline">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <k.icon className="w-3.5 h-3.5" style={{ color: k.label === 'AVANCE' ? AMBER : 'hsl(var(--primary))' }} />
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{k.label}</span>
              </div>
              <span className="font-mono text-xl font-bold text-foreground">{k.value}</span>
            </div>
            {k.prompt && (
              <button onClick={() => alConsultar?.(k.prompt)}
                className="text-[11px] text-primary hover:underline text-left">
                {k.prompt} →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Consultas sugeridas */}
      <div className="px-5 py-4 flex-1 overflow-y-auto min-h-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Consultas sugeridas para probar
        </div>
        <div className="space-y-2">
          {CONSULTAS_SUGERIDAS.map(q => (
            <button key={q} onClick={() => alConsultar?.(q)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-foreground/80 bg-surface-raised border border-hairline hover:border-primary/40 transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* CTA WhatsApp */}
      <div className="px-5 py-4 border-t border-hairline">
        <Link to="/demo"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-colors hover:bg-surface-raised"
          style={{ borderColor: AMBER, color: AMBER }}>
          <MessageCircle className="w-4 h-4" /> Ver demo por WhatsApp
        </Link>
      </div>
    </aside>
  );
}