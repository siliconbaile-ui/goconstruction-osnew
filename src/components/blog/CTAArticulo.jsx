import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PlayCircle, MessageSquare } from 'lucide-react';

// Cierre del artículo: el lector llega con una duda técnica resuelta, así que
// el paso natural es conversarlo con GO en la landing del caso, o entrar al demo.
export default function CTAArticulo({ articulo }) {
  const track = (eventName) => base44.analytics.track({ eventName, properties: { articulo: articulo.slug } });

  return (
    <section className="p-5 rounded-2xl bg-surface border border-hairline space-y-3">
      <h2 className="text-base font-semibold text-foreground">Pruébalo sobre una obra cargada</h2>
      <p className="text-sm text-muted-foreground">
        GO aplica este criterio con tus planos y EETT: cita la página exacta, levanta la no conformidad y bloquea el pago cuando corresponde.
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Link to="/demo" onClick={() => track('ver_demo')}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
          <PlayCircle className="w-4 h-4" /> Ver demo completa
        </Link>
        <Link to={articulo.caso} onClick={() => track('ir_a_caso')}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-hairline bg-surface-raised text-foreground">
          <MessageSquare className="w-4 h-4" /> Conversarlo con GO
        </Link>
      </div>
    </section>
  );
}