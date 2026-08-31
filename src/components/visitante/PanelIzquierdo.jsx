import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, FileText, DollarSign, UserPlus } from 'lucide-react';
import Logo from '@/components/marca/Logo';

const AMBER = '#E8912E';

const USE_CASES = [
  { icon: TrendingUp, label: 'Avance y Curva S' },
  { icon: ShieldCheck, label: 'Calidad (No Quality, No Pay)' },
  { icon: FileText, label: 'RDIs e Indexación' },
  { icon: DollarSign, label: 'Estados de Pago' },
];

// Columna izquierda · Identidad y relato.
export default function PanelIzquierdo() {
  return (
    <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 border-r border-hairline bg-surface-base h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-hairline">
        <Logo tamano="sm" conBajada={false} />
      </div>

      {/* Título y relato */}
      <div className="px-5 py-6 flex-shrink-0">
        <h1 className="text-2xl font-bold leading-tight text-foreground">
          El command center de tu obra.
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          No es un dashboard con chat. Es una obra que se opera conversando con GO, tu jefe técnico digital.
        </p>
      </div>

      {/* Real use cases */}
      <div className="px-5 py-4 border-t border-hairline flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
          Real use cases
        </div>
        <div className="space-y-3.5">
          {USE_CASES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${AMBER}18`, color: AMBER }}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium text-foreground/90">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 border-t border-hairline">
        <Link to="/register"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: AMBER, color: '#fff' }}>
          <UserPlus className="w-4 h-4" /> Crear cuenta
        </Link>
      </div>
    </aside>
  );
}