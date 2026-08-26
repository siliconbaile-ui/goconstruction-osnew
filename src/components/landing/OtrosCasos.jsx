import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CASOS } from '@/lib/casosUso';

// Enlazado interno entre landings: reparte autoridad y mantiene al visitante
// explorando en vez de salir.
export default function OtrosCasos({ actual }) {
  const otros = Object.values(CASOS).filter(c => c.ruta !== actual);
  return (
    <section className="space-y-2.5">
      <h2 className="text-lg font-semibold text-foreground">Otros frentes de la obra</h2>
      <div className="grid sm:grid-cols-3 gap-2.5">
        {otros.map(c => (
          <Link key={c.ruta} to={c.ruta}
            className="p-4 rounded-2xl bg-surface border border-hairline hover:border-primary/40 transition-colors">
            <span className="font-mono text-[10px] tracking-widest text-primary">{c.etiqueta}</span>
            <p className="mt-1.5 text-sm font-semibold text-foreground leading-snug">{c.h1}</p>
            <ArrowUpRight className="w-3.5 h-3.5 mt-2 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}