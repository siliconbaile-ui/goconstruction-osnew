import { Play, Compass, Sparkles } from 'lucide-react';
import Logo from '@/components/marca/Logo';

export default function GoDemoWelcome({ onStart, onSkip }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-foreground/10 bg-surface p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Conoce el sistema en 12 lecciones</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">GO recorre cada módulo de la plataforma: tablero, terreno, calidad, pagos, RDIs, alertas e informes. Toma unos minutos y puedes avanzar, retroceder o detener cuando quieras.</p>
        </div>
        <div className="space-y-3">
          <button onClick={onStart} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80">
            <Play className="h-5 w-5" />
            Ver demo completo
          </button>
          <button onClick={onSkip} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface-raised px-4 text-sm font-medium text-foreground/70">
            <Compass className="h-4 w-4" />
            Explorar por mi cuenta
          </button>
        </div>
      </div>
    </div>
  );
}