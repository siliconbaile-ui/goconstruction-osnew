import { ChevronLeft, ChevronRight, Volume2, Check, X } from 'lucide-react';

export default function GoDemoOverlay({ plan, index, speaking, finished, onStop, onNext, onPrev, onDismiss }) {
  const step = plan.steps[index];
  const total = plan.steps.length;
  const isLast = index === total - 1;

  if (finished) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-primary/40 bg-card p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ok/20 text-ok">
              <Check className="h-7 w-7" />
            </span>
            <h2 className="text-lg font-bold text-foreground">Recorrido completo</h2>
            <p className="mt-2 text-sm text-muted-foreground">Has visto las {total} lecciones del sistema. Ya puedes explorar por tu cuenta o repetir el demo cuando quieras desde el botón DEMO GO.</p>
            <button onClick={onDismiss} className="mt-6 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Cerrar y no mostrar más
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="fixed z-[100] left-1/2 -translate-x-1/2 bottom-5 w-[min(94vw,680px)] rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-xl shadow-2xl p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary ${speaking ? 'animate-pulse' : ''}`}>
          <Volume2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary">GO · lección {index + 1} de {total}</p>
          <p className="truncate text-sm font-semibold">{step?.title || plan.title}</p>
        </div>
        <button onClick={onStop} aria-label="Detener demo" className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-raised text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{step?.narration}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onPrev} disabled={index === 0} aria-label="Lección anterior" className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-raised text-foreground/80 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={onNext} className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground">
            {isLast ? 'Finalizar' : 'Siguiente'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}