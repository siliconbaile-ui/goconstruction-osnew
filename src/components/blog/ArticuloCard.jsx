import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Tarjeta de listado: categoría, título y resumen. El título es el enlace
// principal para que el ancla que indexa Google sea la keyword del artículo.
export default function ArticuloCard({ articulo }) {
  return (
    <article className="p-4 rounded-2xl bg-surface border border-hairline">
      <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-muted-foreground">
        <span className="text-primary">{articulo.categoria.toUpperCase()}</span>
        <span>·</span>
        <span>{articulo.lectura}</span>
      </div>
      <h2 className="text-base font-semibold leading-snug mb-1.5">
        <Link to={`/blog/${articulo.slug}`} className="text-foreground hover:text-primary">
          {articulo.titulo}
        </Link>
      </h2>
      <p className="text-sm text-muted-foreground mb-3">{articulo.resumen}</p>
      <Link to={`/blog/${articulo.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
        Leer artículo <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </article>
  );
}