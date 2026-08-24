import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Gauge, TrendingUp, ShieldCheck, ClipboardList, Wallet,
  Settings2, Bell, ChevronRight, Menu, X, Radio, Bot, DatabaseZap,
  FileBarChart, BookOpen, Camera, HardHat, Zap
} from 'lucide-react';
import MobileTabBar from '@/components/MobileTabBar';
import ThemeToggle from '@/components/ThemeToggle';
import NotificacionesMovil from '@/components/pwa/NotificacionesMovil';
import InstalarApp from '@/components/pwa/InstalarApp';

const NAV_GROUPS = [
  {
    titulo: 'OPERACIÓN',
    items: [
      { label: 'Asistente GO', path: '/', icon: Bot },
      { label: 'Visión Urgente', path: '/vision-urgente', icon: Zap },
      { label: 'Dashboard', path: '/dashboard', icon: Gauge },
      { label: 'Monitor Avance', path: '/monitor-avance', icon: TrendingUp },
    ],
  },
  {
    titulo: 'TERRENO',
    items: [
      { label: 'QA Terreno', path: '/qa-terreno', icon: ShieldCheck },
      { label: 'Evidencia Terreno', path: '/evidencia-terreno', icon: Camera },
      { label: 'Gestor RDI', path: '/gestor-rdi', icon: ClipboardList },
    ],
  },
  {
    titulo: 'CONTROL',
    items: [
      { label: 'Semáforo Pagos', path: '/semaforo-pagos', icon: Wallet },
      { label: 'Centro de Alertas', path: '/centro-alertas', icon: Bell },
      { label: 'Informe Ejecutivo', path: '/informe-ejecutivo', icon: FileBarChart },
    ],
  },
  {
    titulo: 'PLATAFORMA',
    items: [
      { label: 'Base Conocimiento', path: '/base-conocimiento', icon: BookOpen },
      { label: 'Sincronización', path: '/sincronizacion', icon: DatabaseZap },
      { label: 'Configuración', path: '/configuracion', icon: Settings2 },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-surface-base text-foreground">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'hsl(var(--surface-1))', borderRight: '1px solid hsl(var(--hairline))' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--hairline))' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary))' }}>
              <HardHat className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight tracking-wide text-foreground">GoConstruction <span style={{ color: 'hsl(var(--primary))' }}>OS</span></div>
              <div className="font-mono text-[10px] leading-tight text-muted-foreground">COMMAND CENTER · BESALCO</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status */}
        <div className="mx-4 my-3 px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--hairline))' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--ok))' }} />
          <span className="text-[11px] font-mono" style={{ color: 'hsl(var(--ok))' }}>SISTEMA OPERATIVO</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-2 overflow-y-auto space-y-4">
          {NAV_GROUPS.map(grupo => (
            <div key={grupo.titulo}>
              <div className="px-3 pb-1.5 font-mono text-[9px] tracking-[0.18em] text-muted-foreground">{grupo.titulo}</div>
              <div className="space-y-0.5">
                {grupo.items.map(({ label, path, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={active
                        ? { background: 'hsl(var(--primary) / 0.14)', color: 'hsl(var(--primary))', boxShadow: 'inset 2px 0 0 hsl(var(--primary))' }
                        : { color: 'hsl(var(--muted-foreground))' }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                      <span>{label}</span>
                      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid hsl(var(--hairline))' }}>
          <div className="text-[10px] font-mono space-y-1 text-muted-foreground">
            <div>OBRA PILOTO · ACTIVA</div>
            <div>B2BYTES · GOCONSTRUCTION OS v1.0</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <InstalarApp />
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 flex-shrink-0"
          style={{
            background: 'hsl(var(--surface-1))',
            borderBottom: '1px solid hsl(var(--hairline))',
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <span className="lg:hidden font-bold text-sm tracking-wide text-foreground">GoConstruction <span style={{ color: 'hsl(var(--primary))' }}>OS</span></span>
            <div className="hidden lg:block font-mono text-xs text-muted-foreground">
              GOCONSTRUCTION OS · COMMAND CENTER · <span style={{ color: 'hsl(var(--ok))' }}>OBRA PILOTO ACTIVA</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[11px] text-muted-foreground"
              style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--hairline))' }}>
              <Radio className="w-3 h-3" style={{ color: 'hsl(var(--ok))' }} />
              SYNC <span style={{ color: 'hsl(var(--ok))' }}>OK</span>
            </div>
            <ThemeToggle />
            <NotificacionesMovil />
            <Link to="/centro-alertas" title="Centro de Alertas"
              className="relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--hairline))' }}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'hsl(var(--danger))' }} />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto min-h-0 bg-surface-base">
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}