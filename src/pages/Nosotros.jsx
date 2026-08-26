import { Link } from 'react-router-dom';
import Logo from '@/components/marca/Logo';
import FooterPublico from '@/components/marca/FooterPublico';

// Página pública institucional: qué es GoConstruction OS, para quién y quién lo construye.
export default function Nosotros() {
  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14">
        <Link to="/"><Logo /></Link>

        <h1 className="text-2xl sm:text-4xl font-semibold leading-tight mt-8 mb-5">
          Nosotros · GoConstruction OS
        </h1>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <p>
            GoConstruction OS es un sistema operativo conversacional para obras de construcción. En vez de otro panel de
            indicadores que nadie abre en terreno, la obra se opera hablando con <strong className="text-foreground">GO</strong>,
            un jefe técnico digital que conoce el estado real del proyecto: partidas y avance programado versus real,
            inspecciones de calidad y no conformidades, requerimientos de información (RDIs), estados de pago, alertas y
            documentos técnicos indexados como planos, especificaciones técnicas y normativa.
          </p>
          <p>
            Lo que nos hace distintos es la trazabilidad. GO no estima ni improvisa: cuando responde una consulta técnica
            cita el documento y la página exacta, de modo que la respuesta sirve para tomar una decisión en terreno y
            defenderla después ante la inspección técnica o el mandante. Además aplica reglas de negocio del rubro sin que
            nadie tenga que recordarlas: si existe una no conformidad crítica abierta en una partida, el estado de pago
            asociado se bloquea; si una alerta lleva más de veinticuatro horas sin respuesta, escala al nivel siguiente; si
            un RDI ya fue respondido antes, lo intercepta en vez de duplicar el trámite.
          </p>
          <p>
            Está pensado para constructoras e inmobiliarias que operan en Chile, y para todos los perfiles que conviven en
            una obra: gerencia que necesita el semáforo y el monto en riesgo, administradores de obra que gestionan plata,
            plazo y subcontratos, jefes de terreno y capataces que registran avance con una mano desde el celular, jefaturas
            de calidad que cierran no conformidades con evidencia, oficinas técnicas que emiten y responden RDIs, y
            prevencionistas que verifican el cumplimiento del DS 594 y la Ley 16.744. El capataz puede mandar una foto o un
            documento por WhatsApp y queda registrado en la obra al instante, con georreferenciación cuando corresponde.
          </p>
          <p>
            GoConstruction OS es desarrollado por <strong className="text-foreground">B2BYTES</strong>, equipo chileno de
            producto y tecnología especializado en agentes de inteligencia artificial aplicados a la industria de la
            construcción, con criterio técnico validado en terreno junto a profesionales del rubro.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-8">
          <Link to="/demo" className="flex items-center justify-center px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
            Ver la demo
          </Link>
          <Link to="/contacto" className="flex items-center justify-center px-5 py-3.5 rounded-xl text-sm font-semibold border border-hairline bg-surface-raised text-foreground">
            Contactar al equipo
          </Link>
        </div>

        <FooterPublico />
      </div>
    </div>
  );
}