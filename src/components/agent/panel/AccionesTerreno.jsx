import { Link } from 'react-router-dom';
import { ShieldCheck, ClipboardList, ChevronRight } from 'lucide-react';

const ACCIONES = [
  {
    label: 'Inspecciones',
    meta: 'QA · registrar y cerrar NCs',
    path: '/qa-terreno',
    icon: ShieldCheck,
  },
  {
    label: 'RDIs',
    meta: 'emitir y responder',
    path: '/gestor-rdi',
    icon: ClipboardList,
  },
];

// Acciones principales de terreno: objetivos táctiles grandes (mín. 64px)
// pensados para uso con guantes o una mano en obra.
export default function AccionesTerreno() {
  return (
    <div className="grid grid-cols-2 gap-3 min-w-0">
      {ACCIONES.map(({ label, meta, path, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className="min-w-0 max-w-full overflow-hidden flex items-center gap-2.5 sm:gap-3 rounded-2xl px-3 sm:px-3.5 py-4 min-h-[72px] sm:min-h-[56px] bg-surface border border-hairline active:scale-[0.98] transition-transform"
        >
          <span className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--primary) / 0.14)' }}>
            <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-primary" strokeWidth={2} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm sm:text-[13px] font-semibold leading-tight truncate text-foreground">{label}</span>
            <span className="block text-[10px] leading-tight truncate text-muted-foreground">{meta}</span>
          </span>
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground hidden sm:block" />
        </Link>
      ))}
    </div>
  );
}