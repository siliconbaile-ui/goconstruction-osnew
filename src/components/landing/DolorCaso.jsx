import { AlertTriangle } from 'lucide-react';

export default function DolorCaso({ caso }) {
  return (
    <section className="p-5 rounded-2xl border"
      style={{ borderColor: 'hsl(var(--danger) / 0.3)', background: 'hsl(var(--danger) / 0.06)' }}>
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-3 text-foreground">
        <AlertTriangle className="w-4 h-4" style={{ color: 'hsl(var(--danger))' }} />
        Lo que pasa hoy en la mayoría de las obras
      </h2>
      <ul className="space-y-2">
        {caso.dolor.map(d => (
          <li key={d} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'hsl(var(--danger))' }} />
            {d}
          </li>
        ))}
      </ul>
    </section>
  );
}