import { Link } from 'react-router-dom';
import { LayoutGrid, CreditCard } from 'lucide-react';

const ATAJOS = [
  { label: 'Kanban de RDIs', meta: 'flujo de requerimientos', path: '/gestor-rdi', icon: LayoutGrid },
  { label: 'Estado de pagos', meta: 'semáforo de EDPs', path: '/semaforo-pagos', icon: CreditCard },
];

// Acceso rápido siempre visible mientras Orion trabaja.
export default function AtajosOperacion() {
  return (
    <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ background: 'hsl(var(--foreground))', border: '1px solid hsl(var(--surface-1))' }}>
      <div className="px-4 pt-3 pb-2 text-[10px] font-mono tracking-widest" style={{ color: 'hsl(var(--primary))' }}>
        ACCESO RÁPIDO
      </div>
      {ATAJOS.map(({ label, meta, path, icon: Icon }) => (
        <Link key={path} to={path}
          className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(var(--surface-2))' }}>
            <Icon className="w-3.5 h-3.5" style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight" style={{ color: 'hsl(var(--foreground))' }}>{label}</div>
            <div className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{meta}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}