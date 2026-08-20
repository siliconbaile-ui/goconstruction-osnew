import { ArrowRight, AlertTriangle, TrendingUp, FileText, CreditCard } from 'lucide-react';

const ETAPAS = ['OBSERVA', 'APRENDE', 'ACTÚA', 'VERIFICA', 'MEJORA'];

const TILES = [
  { label: 'Ver alertas', sub: 'activas ahora', icon: AlertTriangle, prompt: '¿Qué alertas activas tengo ahora?' },
  { label: 'Resumir avance', sub: 'desviaciones clave', icon: TrendingUp, prompt: 'Resume las desviaciones de avance críticas' },
  { label: 'Gestionar RDIs', sub: 'abiertos y vencidos', icon: FileText, prompt: 'Lista los RDIs abiertos y vencidos' },
  { label: 'Revisar pagos', sub: 'EDPs bloqueados', icon: CreditCard, prompt: '¿Qué EDPs están bloqueados y por qué?' },
];

const CHIPS = [
  '¿Qué es lo más urgente hoy?',
  'Tengo atraso en enfierradura',
  'Escala lo que lleva +24h',
  '¿Cuánto dinero está retenido?',
];

export default function WelcomeHero({ onPrompt, activo }) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Mensaje de apertura */}
      <div className="flex gap-3 mb-5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-primary">
          <span className="text-primary-foreground text-[11px] font-bold">O</span>
        </div>
        <div className="rounded-2xl rounded-tl-md px-4 sm:px-5 py-4 bg-surface border border-hairline">
          <p className="text-sm leading-relaxed text-foreground">
            Hola, soy Orion. Acá el asistente no acompaña la obra: el asistente <strong>opera</strong> la obra.
            Dime qué te preocupa y te muestro la obra en vivo.
          </p>
        </div>
      </div>

      {/* Ciclo agéntico */}
      <div className="rounded-2xl p-4 sm:p-5 mb-6 bg-surface border border-hairline">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-mono tracking-widest text-primary">CICLO 1 · CÓMO OPERA ORION</div>
          <div className="flex gap-1">
            {ETAPAS.map((e, i) => (
              <span key={e} className={`w-5 h-0.5 rounded-full ${activo && i <= 2 ? 'bg-primary' : 'bg-hairline'}`} />
            ))}
          </div>
        </div>
        <h2 className="text-xl font-semibold leading-snug mb-2 text-foreground">
          Tu obra deja de ser un reporte y pasa a ser una conversación
        </h2>
        <p className="text-sm leading-relaxed mb-4 text-muted-foreground">
          Orion vigila las partidas, bloquea el pago sin calidad y escala la alerta sola.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
          {ETAPAS.map((e, i) => (
            <div key={e} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-surface-raised text-primary">{i + 1}</span>
              <span className="text-[11px] font-mono tracking-wider text-muted-foreground">{e}</span>
            </div>
          ))}
        </div>
        <button onClick={() => onPrompt('¿Qué es lo más urgente en la obra ahora mismo y qué debo hacer primero?')}
          className="w-full flex items-center justify-center gap-2 min-h-12 py-3 rounded-full text-xs font-semibold tracking-wide bg-primary text-primary-foreground active:scale-[0.99]">
          ¿Y QUÉ ES LO MÁS URGENTE HOY? <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {TILES.map(({ label, sub, icon: Icon, prompt }) => (
          <button key={label} onClick={() => onPrompt(prompt)}
            className="text-left p-4 min-h-[104px] rounded-2xl bg-surface border border-hairline transition-all hover:border-primary/40 active:scale-[0.98]">
            <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center mb-3 bg-surface-raised">
              <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="font-semibold text-sm text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </button>
        ))}
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(c => (
          <button key={c} onClick={() => onPrompt(c)}
            className="px-4 min-h-11 flex items-center rounded-full text-sm sm:text-xs bg-surface border border-hairline text-foreground/80 transition-colors hover:border-primary/40 active:scale-[0.98]">
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}