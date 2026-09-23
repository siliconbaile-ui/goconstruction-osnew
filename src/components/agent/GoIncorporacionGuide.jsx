import { ArrowUpRight, Building2 } from 'lucide-react';

export default function GoIncorporacionGuide({ onPrompt, disabled }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center py-5">
      <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-7">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground">
          Hagamos espacio para tu empresa.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Cuéntame qué haces en obra y qué te gustaría resolver con GO. Te orientaré con el siguiente paso, sin salir de esta conversación.
        </p>
        <button type="button" disabled={disabled} onClick={() => onPrompt('Quiero avanzar con mi empresa en GoConstruction OS. ¿Por dónde comenzamos?')}
          className="mt-5 flex min-h-12 w-full items-center justify-between rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          Comenzar conversación <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}