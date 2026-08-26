import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
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

// Landing agéntica por caso de uso: lo primero que ve el visitante es GO ya
// situado en un escenario real de obra. El argumento escrito viene después,
// como respaldo de lo que acaba de experimentar.
export default function LandingCaso({ caso }) {
  const jsonLd = useMemo(() => jsonLdCaso(caso), [caso]);
  useSeo({
    titulo: caso.seoTitulo,
    descripcion: caso.seoDescripcion,
    ruta: caso.ruta,
    imagen: OG_IMAGEN,
    jsonLd,
  });

  const evento = (eventName) => {
    base44.analytics.track({ eventName, properties: { caso: caso.ruta } });
  };

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14 space-y-8">
        <HeroCaso caso={caso} />

        <section className="space-y-2.5">
          <p className="text-sm font-semibold text-foreground">{caso.gancho}</p>
          <ChatVisitante
            contexto={caso.contexto}
            saludo={caso.chatSaludo}
            sugerencias={caso.chatChips}
            alEvento={evento}
          />
          <p className="text-[11px] font-mono text-muted-foreground">
            SESIÓN DE DEMOSTRACIÓN · SIN REGISTRO · DATOS DE OBRA DE EJEMPLO
          </p>
        </section>

        <DolorCaso caso={caso} />
        <BeneficiosCaso caso={caso} />
        <FAQCaso caso={caso} />

        <section className="p-5 rounded-2xl bg-surface border border-hairline space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Entra al demo completo</h2>
          <p className="text-sm text-muted-foreground">
            La obra de ejemplo ya está cargada: avance, calidad, RDIs y estados de pago. Recorre lo que acabas de conversar, y cuando quieras cambia a tu obra real.
          </p>
          <CTACaso caso={caso} ubicacion="cierre" />
        </section>

        <OtrosCasos actual={caso.ruta} />
        <FooterPublico />
      </div>
    </div>
  );
}