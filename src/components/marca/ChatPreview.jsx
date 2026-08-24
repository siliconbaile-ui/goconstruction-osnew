import { Sparkles, Check, Mic, ArrowUp } from 'lucide-react';

// Anatomía de la conversación con GO: la unidad de interfaz del OS.
// Se pinta solo con tokens, así que refleja en vivo el tema aplicado.
export default function ChatPreview() {
  return (
    <div className="rounded-2xl overflow-hidden bg-surface-base border border-hairline">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-hairline bg-surface">
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-xs font-semibold text-foreground">GO</div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest" style={{ color: 'hsl(var(--ok))' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(var(--ok))' }} />
            EN VIVO
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-xs leading-relaxed bg-primary text-primary-foreground">
            ¿Qué recubrimiento exige la EETT en losas a la intemperie?
          </div>
        </div>

        <div className="max-w-[88%] space-y-2">
          <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed bg-surface border border-hairline text-foreground">
            <span className="font-semibold">3 cm</span> a la barra más externa. En contacto con terreno, 5 cm.
            <div className="mt-2 rounded-xl px-2.5 py-2 text-[10px] font-mono bg-surface-raised text-muted-foreground"
              style={{ borderLeft: '3px solid hsl(var(--primary))' }}>
              EETT Estructura · p. 27 · cita verificada
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-mono bg-surface-raised border border-hairline"
            style={{ borderLeft: '3px solid hsl(var(--ok))' }}>
            <Check className="w-3 h-3" style={{ color: 'hsl(var(--ok))' }} />
            <span className="text-muted-foreground">Búsqueda híbrida · 8 tramos</span>
            <span className="ml-auto" style={{ color: 'hsl(var(--ok))' }}>LISTO</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['Registrar inspección', 'Abrir RDI', 'Ver plano'].map(a => (
            <span key={a} className="px-3 py-1.5 rounded-full text-[10px] font-medium bg-surface border border-hairline text-foreground/85">{a}</span>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 h-12 px-3 rounded-2xl bg-surface border border-hairline">
          <Mic className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-xs text-muted-foreground">Habla o escribe como en terreno…</span>
          <span className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
            <ArrowUp className="w-3.5 h-3.5 text-primary-foreground" />
          </span>
        </div>
      </div>
    </div>
  );
}