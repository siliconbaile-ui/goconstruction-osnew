import { Check } from 'lucide-react';

export default function BeneficiosCaso({ caso }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Cómo lo resuelve GoConstruction OS</h2>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {caso.beneficios.map(b => (
          <article key={b.titulo} className="p-4 rounded-2xl bg-surface border border-hairline">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1.5">
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {b.titulo}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{b.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}