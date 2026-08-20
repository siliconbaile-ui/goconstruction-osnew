import { useState } from 'react';
import {
  Bell, TrendingUp, FileText, CheckSquare, CreditCard, Activity,
  ChevronDown, ChevronUp, Zap, Boxes
} from 'lucide-react';
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
    sub: 'Orion ejecuta por ti',
    icon: Activity,
    items: [
      { label: 'Escalar alertas +24h', meta: 'jerarquía', prompt: 'Escala todas las alertas con más de 24h sin respuesta' },
      { label: 'Cerrar RDIs respondidas', meta: 'limpieza', prompt: 'Cierra las RDIs que ya fueron respondidas' },
      { label: 'Desbloquear EDPs', meta: 'sin NC críticas', prompt: 'Revisa los EDPs bloqueados y desbloquea los que no tengan NC críticas' },
      { label: 'Resumen ejecutivo', meta: 'directorio', prompt: 'Genera un resumen ejecutivo del estado de la obra' },
    ],
  },
];

const ICON_ATAJO = { Bell, TrendingUp, FileText, CheckSquare, CreditCard, Activity };

export default function AgentSidebar({ onPrompt, ficha }) {
  const [abierto, setAbierto] = useState({ 0: true, 1: false });

  return (
    <aside className="w-72 flex-shrink-0 hidden 2xl:flex flex-col gap-4 overflow-y-auto min-h-0 p-4">
      {/* Identidad */}
      <div className="flex items-center gap-3 px-1 pt-1">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#0A1E4D' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-base font-semibold leading-tight" style={{ color: '#141821' }}>Orion</div>
          <div className="text-[10px] font-mono tracking-widest" style={{ color: '#8A94A6' }}>OBRA AGÉNTICA</div>
        </div>
      </div>

      <div className="sticky top-0 z-10 pb-1" style={{ background: '#F6F4F1' }}>
        <AtajosOperacion />
      </div>

      {/* Manifiesto */}
      <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
        <div className="text-[10px] font-mono tracking-widest mb-2" style={{ color: '#003399' }}>
          NATIVO AGÉNTICO · OPERA CONVERSANDO
        </div>
        <p className="text-sm font-semibold leading-snug mb-2" style={{ color: '#141821' }}>
          Acá el asistente no acompaña la obra: el asistente opera la obra.
        </p>
        <p className="text-xs leading-relaxed mb-3" style={{ color: '#6B7382' }}>
          Orion lee avance, calidad, RDIs y pagos, detecta desvíos y escala al nivel que corresponde — en la misma conversación.
        </p>
        <ul className="space-y-1.5">
          {['Los datos viven en el agente, no en un menú', 'Vigila 24/7 y escala solo', 'Ejecuta acciones, no solo responde'].map(t => (
            <li key={t} className="flex gap-2 text-[11px]" style={{ color: '#6B7382' }}>
              <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#003399' }} />
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
          <div key={g.titulo} className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
            <button onClick={() => setAbierto(p => ({ ...p, [gi]: !p[gi] }))}
              className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F4FB' }}>
                <Icon className="w-3.5 h-3.5" style={{ color: '#003399' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight" style={{ color: '#141821' }}>{g.titulo}</div>
                <div className="text-[10px]" style={{ color: '#8A94A6' }}>{g.sub}</div>
              </div>
              <span className="text-[10px] font-mono" style={{ color: '#8A94A6' }}>{g.items.length}</span>
              {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#8A94A6' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#8A94A6' }} />}
            </button>
            {open && (
              <div className="pb-2">
                {g.items.map(it => (
                  <button key={it.label} onClick={() => onPrompt(it.prompt)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-gray-50">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#C8CEDA' }} />
                    <span className="text-xs flex-1 truncate" style={{ color: '#41485A' }}>{it.label}</span>
                    <span className="text-[10px] truncate" style={{ color: '#A8B0BF' }}>{it.meta}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Ficha que se arma sola */}
      <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold" style={{ color: '#141821' }}>Tu obra se arma sola</div>
          <span className="text-[10px] font-mono flex items-center gap-1.5" style={{ color: '#003399' }}>
            {ficha.completos}/4
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#003399' }} />
          </span>
        </div>
        <div className="space-y-0">
          {ficha.filas.map(f => (
            <div key={f.label} className="flex items-center justify-between py-2 text-[11px]" style={{ borderTop: '1px solid #F0EEEA' }}>
              <span className="font-mono tracking-wider" style={{ color: '#8A94A6' }}>{f.label}</span>
              <span className="font-medium" style={{ color: f.alerta ? '#D35400' : '#41485A' }}>{f.valor}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed mt-3" style={{ color: '#8A94A6' }}>
          Cero formularios: Orion completa esta ficha mientras conversan, igual que hará con tu obra.
        </p>
      </div>
    </aside>
  );
}