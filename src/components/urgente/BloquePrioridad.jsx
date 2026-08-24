import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Un frente crítico: título, conteo, impacto y las filas que exigen acción hoy.
// Mobile-first: tarjetas apiladas, sin tablas ni scroll horizontal.
export default function BloquePrioridad({ icon: Icon, titulo, color, conteo, impacto, filas, verMas, vacioTexto }) {
  return (
    <section className="rounded-2xl border border-hairline bg-surface overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `hsl(var(--${color}) / 0.14)` }}>
          <Icon className="w-4 h-4" style={{ color: `hsl(var(--${color}))` }} />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{titulo}</div>
          {impacto && <div className="font-mono text-[10px] text-muted-foreground truncate">{impacto}</div>}
        </div>
        <span className="ml-auto font-mono text-xl font-bold flex-shrink-0" style={{ color: `hsl(var(--${color}))` }}>
          {conteo}
        </span>
      </header>

      {filas.length === 0 ? (
        <p className="px-4 py-4 text-xs text-muted-foreground">{vacioTexto}</p>
      ) : (
        <ul className="divide-y divide-hairline">
          {filas.map(f => (
            <li key={f.id} className="px-4 py-3">
              <div className="text-sm text-foreground break-words">{f.titulo}</div>
              <div className="font-mono text-[10px] mt-0.5 break-words" style={{ color: `hsl(var(--${f.tono || 'muted-foreground'}))` }}>
                {f.detalle}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to={verMas} className="flex items-center gap-1 px-4 py-2.5 border-t border-hairline font-mono text-[10px] tracking-wider text-primary">
        VER TODO <ChevronRight className="w-3 h-3" />
      </Link>
    </section>
  );
}