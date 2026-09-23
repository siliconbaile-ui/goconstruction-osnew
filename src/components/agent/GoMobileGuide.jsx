import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function GoMobileGuide({ onPrompt, disabled }) {
  return (
    <div className="go-mobile-guide mx-auto flex max-w-md flex-col justify-center py-5 sm:hidden">
      <div className="rounded-2xl border border-hairline bg-surface p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground">
          ¿Qué necesitas resolver en tu obra?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Cuéntale a GO qué pasó, en qué obra y qué decisión necesitas tomar. También puedes adjuntar una foto o un plano.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" disabled={disabled} onClick={() => onPrompt('¿Qué es lo más urgente en la obra ahora mismo y qué debo hacer primero?')}
            className="flex min-h-12 items-center justify-between gap-1 rounded-xl bg-primary px-3 text-left text-xs font-semibold text-primary-foreground disabled:opacity-50">
            Ver lo urgente <ArrowUpRight className="h-4 w-4 shrink-0" />
          </button>
          <button type="button" disabled={disabled} onClick={() => onPrompt('¿Qué pagos están bloqueados y qué hace falta para desbloquearlos?')}
            className="flex min-h-12 items-center justify-between gap-1 rounded-xl border border-hairline bg-surface-raised px-3 text-left text-xs font-semibold text-foreground disabled:opacity-50">
            Revisar pagos <ArrowUpRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}