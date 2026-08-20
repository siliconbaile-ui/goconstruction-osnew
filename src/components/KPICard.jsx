import OrionCard from './OrionCard';

export default function KPICard({ label, value, sub, color = 'hsl(var(--info))', icon: Icon, trend }) {
  return (
    <OrionCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-lg" style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--hairline))' }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground mb-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      {trend !== undefined && (
        <div className="text-xs mt-2 font-mono" style={{ color: trend <= 0 ? 'hsl(var(--ok))' : 'hsl(var(--danger))' }}>
          {trend > 0 ? `▲ ${trend.toFixed(1)}% desviación` : `▼ ${Math.abs(trend).toFixed(1)}% adelantado`}
        </div>
      )}
    </OrionCard>
  );
}