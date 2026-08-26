import { Link, useLocation } from 'react-router-dom';
import { Bot, Camera, ClipboardList, Wallet, BellRing } from 'lucide-react';

const TABS = [
  { label: 'GO', path: '/app', icon: Bot },
  { label: 'Terreno', path: '/evidencia-terreno', icon: Camera },
  { label: 'RDIs', path: '/gestor-rdi', icon: ClipboardList },
  { label: 'Pagos', path: '/semaforo-pagos', icon: Wallet },
  { label: 'Alertas', path: '/centro-alertas', icon: BellRing },
];

// Navegación inferior para uso con una mano en terreno.
export default function MobileTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="lg:hidden flex-shrink-0 flex items-stretch"
      style={{
        background: 'hsl(var(--surface-1))',
        borderTop: '1px solid hsl(var(--hairline))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      {TABS.map(({ label, path, icon: Icon }) => {
        const activo = pathname === path;
        return (
          <Link key={path} to={path}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[60px] py-3 transition-colors active:opacity-70"
            style={{ color: activo ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
            {activo && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
            )}
            <Icon className="w-[22px] h-[22px]" strokeWidth={activo ? 2.2 : 1.7} />
            <span className="font-mono text-[9px] tracking-wider">{label.toUpperCase()}</span>
          </Link>
        );
      })}
    </nav>
  );
}