import { Link } from 'react-router-dom';
import { Mail, MessageCircle, MapPin, Linkedin } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import FooterPublico from '@/components/marca/FooterPublico';

const CORREO = 'contacto@b2bytes.cl';

// Página pública de contacto: vías directas para constructoras y mandantes.
export default function Contacto() {
  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14">
        <Link to="/"><Logo /></Link>

        <h1 className="text-2xl sm:text-4xl font-semibold leading-tight mt-8 mb-3">
          Contacto
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mb-8 max-w-xl">
          Escríbenos para coordinar una demostración con los datos de tu obra, resolver dudas técnicas de implementación o
          conversar condiciones para tu constructora. Respondemos en horario hábil de Chile.
        </p>

        <div className="space-y-3">
          <a href={`mailto:${CORREO}`}
            className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-hairline hover:border-primary/40 transition-colors">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-raised flex-shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">Correo</span>
              <span className="block text-xs text-muted-foreground break-all">{CORREO}</span>
            </span>
          </a>

          <a href="https://wa.me/?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20de%20GoConstruction%20OS" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-hairline hover:border-primary/40 transition-colors">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-raised flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-primary" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">WhatsApp</span>
              <span className="block text-xs text-muted-foreground">Escríbenos como se escribe en terreno</span>
            </span>
          </a>

          <a href="https://www.linkedin.com/company/b2bytes" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-hairline hover:border-primary/40 transition-colors">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-raised flex-shrink-0">
              <Linkedin className="w-4 h-4 text-primary" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">LinkedIn</span>
              <span className="block text-xs text-muted-foreground">B2BYTES</span>
            </span>
          </a>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-hairline">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-raised flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">Ubicación</span>
              <span className="block text-xs text-muted-foreground">Santiago, Chile · operamos en todo el país</span>
            </span>
          </div>
        </div>

        <FooterPublico />
      </div>
    </div>
  );
}