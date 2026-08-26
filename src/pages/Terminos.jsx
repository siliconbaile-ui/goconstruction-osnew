import { Link } from 'react-router-dom';
import Logo from '@/components/marca/Logo';
import FooterPublico from '@/components/marca/FooterPublico';

// Página pública de términos de servicio (página de confianza).
export default function Terminos() {
  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14">
        <Link to="/"><Logo /></Link>

        <h1 className="text-2xl sm:text-4xl font-semibold leading-tight mt-8 mb-3">
          Términos de servicio
        </h1>
        <p className="text-xs font-mono tracking-widest text-muted-foreground mb-8">
          ÚLTIMA ACTUALIZACIÓN · AGOSTO 2026
        </p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">El servicio</h2>
            <p>
              GoConstruction OS es una plataforma de gestión de obras que incluye un asistente de inteligencia artificial
              (GO) para consultar y operar la información del proyecto. El servicio se entrega a través de internet y puede
              evolucionar con nuevas funciones y mejoras.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Cuentas y uso adecuado</h2>
            <p>
              Cada usuario es responsable de la confidencialidad de sus credenciales y del contenido que carga. No está
              permitido usar la plataforma para fines ilícitos, cargar contenido sobre el cual no se tengan derechos, ni
              intentar acceder a datos de otras empresas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Propiedad de la información</h2>
            <p>
              Los datos de obra, documentos y evidencia que cargas siguen siendo de tu empresa. Nosotros conservamos la
              propiedad del software, la marca y los desarrollos de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Criterio técnico y responsabilidad</h2>
            <p>
              Las respuestas del asistente se apoyan en los documentos y datos cargados por tu empresa y citan su fuente,
              pero constituyen un apoyo a la decisión y no reemplazan la revisión ni la firma del profesional competente.
              Las decisiones constructivas, contractuales y de seguridad siguen siendo responsabilidad de la constructora y
              de sus profesionales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Disponibilidad y término</h2>
            <p>
              Trabajamos para mantener el servicio disponible de forma continua, con eventuales ventanas de mantención.
              Puedes dar de baja tu cuenta en cualquier momento; también podemos suspender cuentas que incumplan estos
              términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Ley aplicable</h2>
            <p>
              Estos términos se rigen por la legislación chilena. Consultas sobre este documento:{' '}
              <a href="mailto:contacto@b2bytes.cl" className="text-primary">contacto@b2bytes.cl</a> o la página de{' '}
              <Link to="/contacto" className="text-primary">contacto</Link>.
            </p>
          </section>
        </div>

        <FooterPublico />
      </div>
    </div>
  );
}