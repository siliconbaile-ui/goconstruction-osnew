import { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Zap, Boxes } from 'lucide-react';
import WhatsAppConnect from './WhatsAppConnect';
import AtajosOperacion from './AtajosOperacion';

const GRUPOS = [
  {
    titulo: 'Frentes de obra',
    sub: 'pregunta conversando',
    icon: Boxes,
    items: [
      { label: 'Alertas activas', meta: 'criticidad', prompt: 'Muéstrame las alertas activas ordenadas por criticidad' },
      { label: 'Desviaciones', meta: 'avance vs programa', prompt: 'Resume las desviaciones de avance críticas' },
      { label: 'RDIs', meta: 'abiertos y vencidos', prompt: 'Lista los RDIs abiertos y vencidos' },
      { label: 'Inspecciones', meta: 'NC abiertas', prompt: 'Muéstrame las inspecciones y no conformidades abiertas' },
      { label: 'Estados de pago', meta: 'bloqueos', prompt: '¿Qué EDPs están bloqueados y por qué?' },
      { label: 'Partidas', meta: 'semáforo', prompt: 'Muéstrame el avance de las partidas con semáforo' },
    ],
  },
  {
    titulo: 'Operar la obra',
    sub: 'GO ejecuta por ti',
    icon: Activity,
    items: [
      { label: 'Escalar alertas +24h', meta: 'jerarquía', prompt: 'Escala todas las alertas con más de 24h sin respuesta' },
      { label: 'Cerrar RDIs respondidas', meta: 'limpieza', prompt: 'Cierra las RDIs que ya fueron respondidas' },
      { label: 'Desbloquear EDPs', meta: 'sin NC críticas', prompt: 'Revisa los EDPs bloqueados y desbloquea los que no tengan NC críticas' },
      { label: 'Resumen ejecutivo', meta: 'directorio', prompt: 'Genera un resumen ejecutivo del estado de la obra' },
    ],
  },
];

export default function AgentSidebar({ onPrompt, ficha }) {
  const [abierto, setAbierto] = useState({ 0: true, 1: false });

  return (
    <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto min-h-0 p-4">
      {/* Identidad */}
      <div className="flex items-center gap-3 px-1 pt-1">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <div className="text-base font-semibold leading-tight text-foreground">GO</div>
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground">GOCONSTRUCTION OS</div>
        </div>
      </div>

      <div className="sticky top-0 z-10 pb-1 bg-surface-base">
        <AtajosOperacion />
      </div>

      {/* Manifiesto */}
      <div className="rounded-2xl p-4 bg-surface border border-hairline">
        <div className="text-[10px] font-mono tracking-widest mb-2 text-primary">
          NATIVO AGÉNTICO · OPERA CONVERSANDO
        </div>
        <p className="text-sm font-semibold leading-snug mb-2 text-foreground">
          Acá el asistente no acompaña la obra: el asistente opera la obra.
        </p>
        <ul className="space-y-1.5">
          {['Los datos viven en el agente, no en un menú', 'Vigila 24/7 y escala solo', 'Ejecuta acciones, no solo responde'].map(t => (
            <li key={t} className="flex gap-2 text-[11px] text-muted-foreground">
              <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <WhatsAppConnect />

      {/* Grupos */}
      {GRUPOS.map((g, gi) => {
        const Icon = g.icon;
        const open = abierto[gi];
        return (
          <div key={g.titulo} className="rounded-2xl overflow-hidden bg-surface border border-hairline">
            <button onClick={() => setAbierto(p => ({ ...p, [gi]: !p[gi] }))}
              className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface-raised">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight text-foreground">{g.titulo}</div>
                <div className="text-[10px] text-muted-foreground">{g.sub}</div>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{g.items.length}</span>
              {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {open && (
              <div className="pb-2">
                {g.items.map(it => (
                  <button key={it.label} onClick={() => onPrompt(it.prompt)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-surface-raised">
                    <span className="w-1 h-1 rounded-full flex-shrink-0 bg-muted-foreground" />
                    <span className="text-xs flex-1 truncate text-foreground/85">{it.label}</span>
                    <span className="text-[10px] truncate text-muted-foreground">{it.meta}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Ficha que se arma sola */}
      <div className="rounded-2xl p-4 bg-surface border border-hairline">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-foreground">Tu obra se arma sola</div>
          <span className="text-[10px] font-mono flex items-center gap-1.5 text-primary">
            {ficha.completos}/4
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
        </div>
        <div className="space-y-0">
          {ficha.filas.map(f => (
            <div key={f.label} className="flex items-center justify-between py-2 text-[11px] border-t border-hairline">
              <span className="font-mono tracking-wider text-muted-foreground">{f.label}</span>
              <span className="font-medium" style={{ color: f.alerta ? 'hsl(var(--danger))' : 'hsl(var(--foreground))' }}>{f.valor}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}