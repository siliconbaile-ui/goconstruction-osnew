import { Square, Volume2 } from 'lucide-react';

export default function GoDemoOverlay({ plan, index, speaking, onStop }) {
  const step = plan.steps[index];
  return <aside className="fixed z-[100] left-1/2 -translate-x-1/2 bottom-5 w-[min(92vw,640px)] rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-xl shadow-2xl p-4" role="status" aria-live="polite">
    <div className="flex items-center gap-3">
      <span className={`w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center ${speaking ? 'animate-pulse' : ''}`}><Volume2 className="w-4 h-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-primary">GO · demostración {index + 1}/{plan.steps.length}</p>
        <p className="text-sm font-semibold truncate">{plan.title}</p>
      </div>
      <button onClick={onStop} className="min-h-10 px-3 rounded-lg bg-surface-raised text-xs font-semibold flex items-center gap-2"><Square className="w-3 h-3" /> Detener</button>
    </div>
    <p className="mt-3 text-sm text-foreground/80 line-clamp-2">{step?.narration}</p>
    <div className="mt-3 h-1 rounded-full bg-surface-raised overflow-hidden"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${((index + 1) / plan.steps.length) * 100}%` }} /></div>
  </aside>;
}