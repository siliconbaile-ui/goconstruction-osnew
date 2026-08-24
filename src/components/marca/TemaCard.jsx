import { Check } from 'lucide-react';

export default function TemaCard({ tema, activo, modo, onAplicar }) {
  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col bg-surface border transition-colors ${
      activo ? 'border-primary' : 'border-hairline'}`}>
      {/* Ambas variantes de la paleta: la activa se muestra al doble de alto */}
      <div>
        <div className={`flex transition-all ${modo === 'dark' ? 'h-14' : 'h-7'}`}>
          {tema.swatches.dark.map(c => <div key={`d${c}`} className="flex-1" style={{ background: c }} />)}
        </div>
        <div className={`flex transition-all ${modo === 'light' ? 'h-14' : 'h-7'}`}>
          {tema.swatches.light.map(c => <div key={`l${c}`} className="flex-1" style={{ background: c }} />)}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2">
        <h3 className="text-base font-semibold leading-tight text-foreground">{tema.nombre}</h3>
        <div className="text-[10px] font-mono tracking-widest text-primary">{tema.claim}</div>
        <p className="text-xs leading-relaxed text-muted-foreground">{tema.concepto}</p>
        <p className="text-xs leading-relaxed text-foreground/70"><span className="font-medium">Cuándo:</span> {tema.uso}</p>

        <div className="flex flex-wrap gap-1 mt-1">
          {tema.swatches[modo].map(c => (
            <span key={c} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-raised text-muted-foreground">{c}</span>
          ))}
        </div>

        <button onClick={() => onAplicar(tema.id)} disabled={activo}
          className={`mt-3 h-11 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
            activo ? 'bg-surface-raised text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
          {activo ? <><Check className="w-3.5 h-3.5" /> PALETA ACTIVA</> : 'APLICAR AL OS COMPLETO'}
        </button>
      </div>
    </div>
  );
}