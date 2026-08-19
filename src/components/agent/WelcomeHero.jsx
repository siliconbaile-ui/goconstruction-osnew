import { ArrowRight, Zap, AlertTriangle, TrendingUp, FileText, CreditCard } from 'lucide-react';

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
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#0A1E4D' }}>
          <span className="text-white text-[11px] font-bold">O</span>
        </div>
        <div className="rounded-2xl rounded-tl-md px-5 py-4" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#2B313D' }}>
            Hola, soy Orion. Acá el asistente no acompaña la obra: el asistente <strong>opera</strong> la obra.
            Leo avance, calidad, RDIs y estados de pago, detecto los desvíos y escalo al nivel que corresponde —
            todo en esta misma conversación. Dime qué te preocupa y te muestro la obra en vivo.
          </p>
        </div>
      </div>

      {/* Capítulo / loop agéntico */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-mono tracking-widest" style={{ color: '#003399' }}>CICLO 1 · CÓMO OPERA ORION</div>
          <div className="flex gap-1">
            {ETAPAS.map((e, i) => (
              <span key={e} className="w-5 h-0.5 rounded-full" style={{ background: activo && i <= 2 ? '#003399' : '#E4E0DA' }} />
            ))}
          </div>
        </div>
        <h2 className="text-xl font-semibold leading-snug mb-2" style={{ color: '#141821' }}>
          Tu obra deja de ser un reporte y pasa a ser una conversación
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7382' }}>
          En vez de revisar planillas, buscar el desvío y perseguir al responsable, Orion vigila las partidas,
          bloquea el pago sin calidad y escala la alerta sola.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
          {ETAPAS.map((e, i) => (
            <div key={e} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: '#F1F4FB', color: '#003399' }}>{i + 1}</span>
              <span className="text-[11px] font-mono tracking-wider" style={{ color: '#6B7382' }}>{e}</span>
            </div>
          ))}
        </div>
        <button onClick={() => onPrompt('¿Qué es lo más urgente en la obra ahora mismo y qué debo hacer primero?')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold tracking-wide"
          style={{ background: '#003399', color: 'white' }}>
          ¿Y QUÉ ES LO MÁS URGENTE HOY? <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {TILES.map(({ label, sub, icon: Icon, prompt }) => (
          <button key={label} onClick={() => onPrompt(prompt)}
            className="text-left p-4 rounded-2xl transition-all hover:shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: '#F1F4FB' }}>
              <Icon className="w-4 h-4" style={{ color: '#003399' }} />
            </div>
            <div className="font-semibold text-sm" style={{ color: '#141821' }}>{label}</div>
            <div className="text-xs" style={{ color: '#8A94A6' }}>{sub}</div>
          </button>
        ))}
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(c => (
          <button key={c} onClick={() => onPrompt(c)}
            className="px-3.5 py-2 rounded-full text-xs transition-colors hover:bg-white"
            style={{ background: '#FFFFFF', border: '1px solid #E9E6E1', color: '#41485A' }}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}