import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PlayCircle, ArrowRight } from 'lucide-react';

// CTA doble: demo autoservicio (baja fricción) + registro. Cada clic se mide
// para saber qué landing convierte.
export default function CTACaso({ caso, ubicacion }) {
  const track = (eventName) => {
    base44.analytics.track({ eventName, properties: { caso: caso.ruta, ubicacion } });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2.5">
      <Link to="/demo" onClick={() => track('ver_demo')}
        className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
        <PlayCircle className="w-4 h-4" /> Ver demo con obra cargada
      </Link>
      <Link to="/register" onClick={() => track('registro_iniciado')}
        className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border border-hairline bg-surface-raised text-foreground">
        Probar con mi obra <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}