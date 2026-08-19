import OrionCard from './OrionCard';

export default function KPICard({ label, value, sub, color = '#4A6FA5', icon: Icon, trend }) {
  return (
    <OrionCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#4A6FA5' }}>
          {label}
        </span>
        {Icon && (
          <div className="p-1.5 rounded" style={{ background: `${color}20` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-white mb-1">{value}</div>
      {sub && <div className="text-xs" style={{ color: '#4A6FA5' }}>{sub}</div>}
      {trend !== undefined && (
        <div className={`text-xs mt-2 font-mono ${trend <= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
          {trend > 0 ? `▲ ${trend.toFixed(1)}% desviación` : `▼ ${Math.abs(trend).toFixed(1)}% adelantado`}
        </div>
      )}
    </OrionCard>
  );
}