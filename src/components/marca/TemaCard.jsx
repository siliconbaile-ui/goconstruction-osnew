import { Check, Moon, Sun } from 'lucide-react';

export default function TemaCard({ tema, activo, onAplicar }) {
  const BaseIcon = tema.base === 'dark' ? Moon : Sun;
  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col bg-surface border transition-colors ${
      activo ? 'border-primary' : 'border-hairline'}`}>
      {/* Muestra cromática con los colores reales del tema */}
      <div className="flex h-16">
        {tema.swatches.map(c => (
          <div key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold leading-tight text-foreground">{tema.nombre}</h3>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <BaseIcon className="w-3 h-3" /> {tema.base}
          </span>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-primary">{tema.claim}</div>
        <p className="text-xs leading-relaxed text-muted-foreground">{tema.concepto}</p>
        <p className="text-xs leading-relaxed text-foreground/70"><span className="font-medium">Cuándo:</span> {tema.uso}</p>

        <div className="flex flex-wrap gap-1 mt-1">
          {tema.swatches.map(c => (
            <span key={c} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-raised text-muted-foreground">{c}</span>
          ))}
        </div>

        <button onClick={() => onAplicar(tema.id)} disabled={activo}
          className={`mt-3 h-11 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
            activo ? 'bg-surface-raised text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
          {activo ? <><Check className="w-3.5 h-3.5" /> TEMA ACTIVO</> : 'APLICAR AL OS COMPLETO'}
        </button>
      </div>
    </div>
  );
}