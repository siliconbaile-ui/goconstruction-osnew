import { Link, useLocation } from 'react-router-dom';
import { Bot, Camera, LayoutGrid, CreditCard, Bell } from 'lucide-react';

const TABS = [
  { label: 'Orion', path: '/', icon: Bot },
  { label: 'Terreno', path: '/evidencia-terreno', icon: Camera },
  { label: 'RDIs', path: '/gestor-rdi', icon: LayoutGrid },
  { label: 'Pagos', path: '/semaforo-pagos', icon: CreditCard },
  { label: 'Alertas', path: '/centro-alertas', icon: Bell },
];

// Navegación inferior para uso con una mano en terreno.
export default function MobileTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="lg:hidden flex-shrink-0 flex items-stretch"
      style={{ background: '#040A15', borderTop: '1px solid #0F1D35', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {TABS.map(({ label, path, icon: Icon }) => {
        const activo = pathname === path;
        return (
          <Link key={path} to={path}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            style={{ color: activo ? '#5B8DEF' : '#4A6FA5' }}>
            <Icon className="w-5 h-5" />
            <span className="font-mono text-[9px] tracking-wider">{label.toUpperCase()}</span>
          </Link>
        );
      })}
    </nav>
  );
}