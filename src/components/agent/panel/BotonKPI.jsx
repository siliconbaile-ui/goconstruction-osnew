import { ArrowUpRight } from 'lucide-react';

// KPI como botón: el número manda, y al tocarlo GO analiza ese frente.
export default function BotonKPI({ valor, label, color, onClick }) {
  return (
    <button onClick={onClick}
      className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-left bg-surface-raised border border-hairline transition-colors hover:border-primary/50 active:opacity-80">
      <span className="text-lg font-semibold leading-none tabular-nums" style={{ color }}>{valor}</span>
      <span className="text-[10px] leading-tight text-muted-foreground flex-1 min-w-0">{label}</span>
      <ArrowUpRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/50 group-hover:text-primary" />
    </button>
  );
}