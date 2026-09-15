import { ShieldCheck, TrendingUp, Wallet, FileBarChart } from 'lucide-react';

const prompts = [
  { icon: ShieldCheck, title: 'Calidad y decisiones', text: 'Revisa las NC abiertas de la demo: ¿qué debe verificarse primero y por qué?' },
  { icon: TrendingUp, title: 'Avance y restricciones', text: 'Compara el avance real y programado de la demo e identifica las partidas con mayor brecha.' },
  { icon: Wallet, title: 'No Quality, No Pay', text: '¿Qué estados de pago están bloqueados en la demo y qué evidencia falta para revisarlos?' },
  { icon: FileBarChart, title: 'Informe de jefatura', text: 'Redacta un informe ejecutivo de la demo con evidencia, riesgos y acciones recomendadas.' },
];
export default function PublicGoWelcome({ onPrompt, busy }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5 py-4 sm:py-8">
      <div className="flex gap-3">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">GO</span>
        <div className="rounded-2xl rounded-tl-md border border-hairline bg-surface p-5 text-sm leading-relaxed">Soy GO, tu jefe técnico digital. Podemos revisar avance, calidad, RDIs y pagos de una obra de demostración, o analizar una consulta técnica. No necesitas registrarte para conversar.</div>
      </div>
      <section className="rounded-2xl border border-hairline bg-surface p-5">
        <p className="mb-2 text-[10px] font-mono tracking-widest text-primary">EVIDENCIA → CRITERIO → DECISIÓN</p>
        <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Conversemos sobre lo que necesita atención.</h2>
        <p className="mb-5 text-sm text-muted-foreground">GO consulta la demo y explica qué está pasando, qué falta verificar y cuál es el siguiente paso.</p>
        <button disabled={busy} onClick={() => onPrompt('Consulta la demo y dime qué es lo más urgente, con evidencia y tres acciones prioritarias.')} className="min-h-12 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">¿Qué debo revisar primero?</button>
      </section>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prompts.map(({ icon: Icon, title, text }) => <button key={title} disabled={busy} onClick={() => onPrompt(text)} className="rounded-2xl border border-hairline bg-surface p-5 text-left hover:border-primary/40 disabled:opacity-40"><Icon className="mb-3 h-5 w-5 text-primary" /><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{text}</span></button>)}
      </div>
    </div>
  );
}