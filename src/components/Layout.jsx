import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, CheckSquare, FileText, CreditCard,
  Settings, Bell, ChevronRight, Menu, X, Activity, Zap, Bot, Database, FileBarChart, BookOpen
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Asistente Orion', path: '/', icon: Bot },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Monitor Avance', path: '/monitor-avance', icon: TrendingUp },
  { label: 'QA Terreno', path: '/qa-terreno', icon: CheckSquare },
  { label: 'Base Conocimiento', path: '/base-conocimiento', icon: BookOpen },
  { label: 'Gestor RDI', path: '/gestor-rdi', icon: FileText },
  { label: 'Semáforo Pagos', path: '/semaforo-pagos', icon: CreditCard },
  { label: 'Centro de Alertas', path: '/centro-alertas', icon: Bell },
  { label: 'Sincronización', path: '/sincronizacion', icon: Database },
  { label: 'Informe Ejecutivo', path: '/informe-ejecutivo', icon: FileBarChart },
  { label: 'Configuración', path: '/configuracion', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: '#070D1A' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: '#040A15', borderRight: '1px solid #0F1D35' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #0F1D35' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: '#003399' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight tracking-wide">ORION</div>
              <div className="font-mono text-[10px] leading-tight" style={{ color: '#4A6FA5' }}>BESALCO · CMD CTR</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status bar */}
        <div className="mx-4 my-3 px-3 py-2 rounded flex items-center gap-2" style={{ background: '#0A1628', border: '1px solid #0F1D35' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#27AE60' }} />
          <span className="text-xs font-mono" style={{ color: '#27AE60' }}>SISTEMA OPERATIVO</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all group
                  ${active
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }
                `}
                style={active ? { background: 'rgba(0,51,153,0.25)', borderLeft: '2px solid #003399', color: 'white' } : {}}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span>{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid #0F1D35' }}>
          <div className="text-[10px] font-mono space-y-1" style={{ color: '#2D4A6E' }}>
            <div>OBRA PILOTO · ACTIVA</div>
            <div>B2BYTES · ORION v1.0</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 flex-shrink-0" style={{ background: '#040A15', borderBottom: '1px solid #0F1D35' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block">
              <span className="font-mono text-xs" style={{ color: '#4A6FA5' }}>
                BESALCO COMMAND CENTER ·{' '}
                <span style={{ color: '#27AE60' }}>OBRA PILOTO ACTIVA</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs" style={{ background: '#0A1628', border: '1px solid #0F1D35', color: '#4A6FA5' }}>
              <Activity className="w-3 h-3" style={{ color: '#27AE60' }} />
              <span>SYNC: <span style={{ color: '#27AE60' }}>OK</span></span>
            </div>
            <Link to="/centro-alertas" className="relative p-2 rounded text-slate-400 hover:text-white hover:bg-white/5" title="Centro de Alertas">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#D35400' }} />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ background: '#070D1A' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}