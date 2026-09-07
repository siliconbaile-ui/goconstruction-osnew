export default function PolpaicoMetrics({ items }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    {items.map(({ label, value, detail, tone = 'text-foreground' }) => <div key={label} className="bg-card border border-border rounded-lg p-4 sm:p-5 min-w-0">
      <p className="text-xs text-muted-foreground mb-3">{label}</p><p className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums break-words ${tone}`}>{value}</p>{detail && <p className="text-xs text-muted-foreground mt-2">{detail}</p>}
    </div>)}
  </div>;
}