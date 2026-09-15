import { Repeat2, ShieldCheck, Network, ChevronDown } from 'lucide-react';

const cards = [
  [Repeat2, 'Ciclo operativo', 'Detectar → analizar → proponer → verificar con datos actuales. Cada revisión queda guardada.'],
  [ShieldCheck, 'Mejora de respuestas', 'Un agente revisor contrasta el informe con sus fuentes y solicita correcciones cuando falta sustento.'],
  [Network, 'Coordinación entre áreas', 'GO reúne a especialistas de operación, control y conocimiento; las decisiones críticas siguen en manos del responsable.'],
];
export default function GoLoopIntro({ demo = false }) {
  return <details open className="mx-auto mb-4 max-w-5xl rounded-xl border border-hairline bg-surface p-3">
    <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-xs font-semibold"><span>GO y su equipo de agentes IA</span><ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /></summary>
    <div className="mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">{cards.map(([Icon, title, text]) => <article key={title} className="w-[85%] shrink-0 snap-start rounded-lg bg-surface-raised p-3 sm:w-auto sm:min-w-0"><Icon className="mb-2 h-4 w-4 text-primary" /><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{text}</p></article>)}</div>
    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{demo ? 'Demostración de solo lectura. El seguimiento guardado y los especialistas están disponibles al ingresar a tu espacio de trabajo.' : 'Autonomía acotada: análisis e informes; sin aprobación de pagos ni cierres técnicos. El seguimiento se activa al solicitar una nueva verificación, no es vigilancia continua.'}</p>
  </details>;
}