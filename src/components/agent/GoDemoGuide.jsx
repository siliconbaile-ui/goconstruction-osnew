import { ArrowUpRight, HardHat } from 'lucide-react';

export default function GoDemoGuide({ onPrompt, disabled }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center py-5">
      <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-7">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></div>
        <p className="font-mono text-[10px] tracking-widest text-primary">OBRA DE DEMOSTRACIÓN · BES-2026-01</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground">Edificio Corporativo Las Condes</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Conversa con GO sobre el avance, calidad, RDIs y pagos de esta obra de demostración. Las respuestas usan sus datos de muestra, no los de otras obras.</p>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" disabled={disabled} onClick={() => onPrompt('¿Qué es lo más urgente en la obra demo ahora mismo y qué debo hacer primero?')}
            className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-primary px-4 text-left text-sm font-semibold text-primary-foreground disabled:opacity-50">Ver lo urgente <ArrowUpRight className="h-4 w-4 shrink-0" /></button>
          <button type="button" disabled={disabled} onClick={() => onPrompt('¿Qué pagos están bloqueados en la obra demo y qué falta para revisarlos?')}
            className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-hairline bg-surface-raised px-4 text-left text-sm font-semibold text-foreground disabled:opacity-50">Revisar pagos <ArrowUpRight className="h-4 w-4 shrink-0" /></button>
        </div>
      </div>
    </div>
  );
}