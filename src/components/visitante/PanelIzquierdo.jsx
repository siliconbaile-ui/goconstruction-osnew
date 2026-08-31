import { Link } from 'react-router-dom';
import { PlayCircle, LogIn, UserPlus } from 'lucide-react';
import Logo from '@/components/marca/Logo';

const ETAPAS = [
  { n: 1, label: 'Descubrir', desc: 'Entiende qué hace GO' },
  { n: 2, label: 'Diagnosticar', desc: 'Identifica tu dolor de obra' },
  { n: 3, label: 'Cuantificar', desc: 'Mide el impacto económico' },
  { n: 4, label: 'Demostrar', desc: 'Ve la obra en vivo' },
  { n: 5, label: 'Cerrar', desc: 'Activa tu piloto' },
];

// Sidebar izquierdo tipo youify.lat: marca, progreso de la conversación
// y navegación. Sin lógica — solo presentación.
export default function PanelIzquierdo({ etapa = 1 }) {
  const progreso = Math.round((etapa / ETAPAS.length) * 100);
  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-hairline bg-surface-base h-full">
      {/* Marca */}
      <div className="px-4 py-4 border-b border-hairline">
        <Logo tamano="sm" conBajada={false} />
      </div>

      {/* Progreso de la conversación */}
      <div className="px-4 py-4 border-b border-hairline">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Avance de la conversación
        </div>
        <div className="space-y-2.5">
          {ETAPAS.map(e => (
            <div key={e.n} className="flex items-center gap-2.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${
                e.n < etapa
                  ? 'bg-ok text-ok-foreground'
                  : e.n === etapa
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-raised text-muted-foreground border border-hairline'
              }`}>
                {e.n}
              </span>
              <div className="min-w-0">
                <div className={`text-xs font-medium truncate ${e.n <= etapa ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {e.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="h-1 rounded-full bg-surface-raised overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progreso}%` }} />
          </div>
          <div className="font-mono text-[9px] text-muted-foreground mt-1">{progreso}%</div>
        </div>
      </div>

      {/* Tu ficha se arma sola */}
      <div className="px-4 py-4 border-b border-hairline">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Tu ficha se arma sola
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">EMPRESA</span>
            <span className="text-muted-foreground/50 font-mono">—</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">VERTICAL</span>
            <span className="text-muted-foreground/50 font-mono">—</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">CANALES</span>
            <span className="text-muted-foreground/50 font-mono">—</span>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="mt-auto px-4 py-4 space-y-1">
        <Link to="/demo" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors">
          <PlayCircle className="w-3.5 h-3.5 text-primary" /> Ver demo
        </Link>
        <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors">
          <LogIn className="w-3.5 h-3.5" /> Iniciar sesión
        </Link>
        <Link to="/register" className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground">
          <UserPlus className="w-3.5 h-3.5" /> Crear cuenta
        </Link>
      </div>
    </aside>
  );
}