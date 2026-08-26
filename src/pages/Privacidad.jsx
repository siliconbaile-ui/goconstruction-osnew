import { Link } from 'react-router-dom';
import Logo from '@/components/marca/Logo';
import FooterPublico from '@/components/marca/FooterPublico';

// Página pública de política de privacidad (página de confianza).
export default function Privacidad() {
  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14">
        <Link to="/"><Logo /></Link>

        <h1 className="text-2xl sm:text-4xl font-semibold leading-tight mt-8 mb-3">
          Política de privacidad
        </h1>
        <p className="text-xs font-mono tracking-widest text-muted-foreground mb-8">
          ÚLTIMA ACTUALIZACIÓN · AGOSTO 2026
        </p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Qué datos recopilamos</h2>
            <p>
              Recopilamos los datos de cuenta que entregas al registrarte (nombre, correo electrónico, cargo y empresa) y
              los datos operacionales que tú y tu equipo cargan en la plataforma: obras, partidas, avances, inspecciones de
              calidad, requerimientos de información, estados de pago, alertas, documentos técnicos, fotografías de terreno
              y, cuando lo autorizas, coordenadas de georreferenciación asociadas a esa evidencia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Para qué los usamos</h2>
            <p>
              Usamos esos datos exclusivamente para operar el servicio: mostrar el estado real de tus obras, generar
              alertas, responder consultas técnicas citando tus propios documentos, emitir informes y mantener la
              trazabilidad de las decisiones. No vendemos datos ni los cedemos a terceros con fines publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Aislamiento por empresa</h2>
            <p>
              La información de cada constructora está aislada: los usuarios sólo acceden a los datos de la empresa y las
              obras a las que fueron invitados. Los perfiles con rol de administración dentro de una empresa pueden
              gestionar los usuarios y contenidos de esa empresa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Proveedores tecnológicos</h2>
            <p>
              Para funcionar utilizamos proveedores de infraestructura, modelos de lenguaje, búsqueda semántica y síntesis
              de voz que procesan datos por encargo nuestro y bajo obligaciones de confidencialidad. El envío de contenido
              a estos proveedores se limita a lo necesario para producir la respuesta solicitada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Conservación y eliminación</h2>
            <p>
              Conservamos los datos mientras la cuenta esté activa. Puedes solicitar el acceso, la rectificación o la
              eliminación de tus datos personales, así como la exportación o el borrado de la información de tu empresa,
              escribiendo a <a href="mailto:contacto@b2bytes.cl" className="text-primary">contacto@b2bytes.cl</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Responsable</h2>
            <p>
              El responsable del tratamiento es B2BYTES, Santiago de Chile. Para cualquier consulta sobre privacidad,
              escríbenos a <a href="mailto:contacto@b2bytes.cl" className="text-primary">contacto@b2bytes.cl</a> o desde la
              página de <Link to="/contacto" className="text-primary">contacto</Link>.
            </p>
          </section>
        </div>

        <FooterPublico />
      </div>
    </div>
  );
}