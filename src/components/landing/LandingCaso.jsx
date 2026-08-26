import { useMemo } from 'react';
import useSeo from '@/lib/useSeo';
import { jsonLdCaso, OG_IMAGEN } from '@/lib/casosUso';
import HeroCaso from './HeroCaso';
import DolorCaso from './DolorCaso';
import BeneficiosCaso from './BeneficiosCaso';
import FAQCaso from './FAQCaso';
import OtrosCasos from './OtrosCasos';
import CTACaso from './CTACaso';
import ChatVisitante from '@/components/visitante/ChatVisitante';
import FooterPublico from '@/components/marca/FooterPublico';

// Landing pública por caso de uso: SEO propio, argumento agéntico (GO responde
// en vivo con el criterio del caso) y doble CTA medido.
export default function LandingCaso({ caso }) {
  const jsonLd = useMemo(() => jsonLdCaso(caso), [caso]);
  useSeo({
    titulo: caso.seoTitulo,
    descripcion: caso.seoDescripcion,
    ruta: caso.ruta,
    imagen: OG_IMAGEN,
    jsonLd,
  });

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14 space-y-8">
        <HeroCaso caso={caso} />
        <DolorCaso caso={caso} />
        <BeneficiosCaso caso={caso} />

        <section className="space-y-2.5">
          <h2 className="text-lg font-semibold text-foreground">Pruébalo ahora, sin registrarte</h2>
          <p className="text-sm text-muted-foreground">
            GO responde en vivo. Pregúntale con el vocabulario de tu obra y evalúa el criterio antes de dejar un dato.
          </p>
          <ChatVisitante saludo={caso.chatSaludo} sugerencias={caso.chatChips} />
        </section>

        <FAQCaso caso={caso} />

        <section className="p-5 rounded-2xl bg-surface border border-hairline space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Entra con tu obra real</h2>
          <p className="text-sm text-muted-foreground">
            Puedes partir con la obra demo cargada y luego crear la tuya. Sin instalación y sin cambiar tu forma de trabajar en terreno.
          </p>
          <CTACaso caso={caso} ubicacion="cierre" />
        </section>

        <OtrosCasos actual={caso.ruta} />
        <FooterPublico />
      </div>
    </div>
  );
}