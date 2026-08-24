import { base44 } from '@/api/base44Client';
import { MessageCircle, Camera, FileText, MapPin } from 'lucide-react';

const url = () => base44.agents.getWhatsAppConnectURL('orion_asistente');

// El enlace se genera AL HACER CLIC (token fresco) y se abre en pestaña nueva;
// si el navegador bloquea la ventana, navegamos directo.
const abrirWhatsApp = (e) => {
  e.preventDefault();
  const destino = url();
  const win = window.open(destino, '_blank', 'noopener');
  if (!win) window.location.href = destino;
};

export function WhatsAppButton() {
  return (
    <a href="#whatsapp" onClick={abrirWhatsApp}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold tracking-wide flex-shrink-0"
      style={{ background: 'hsl(var(--ok) / 0.14)', color: 'hsl(var(--ok))' }}>
      <MessageCircle className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">WHATSAPP</span>
    </a>
  );
}

const FLUJO = [
  { Icon: Camera, t: 'Foto de terreno', d: 'GO la analiza, abre la inspección con la foto como evidencia y GPS, y fija la gravedad.' },
  { Icon: FileText, t: 'Plano, EETT o contrato', d: 'Queda como documento técnico e indexado por página: después responde citando la página exacta.' },
  { Icon: MapPin, t: 'Asignación automática', d: 'Todo se asigna a la obra activa; si mencionas otra obra por nombre o código, va a esa.' },
];

export default function WhatsAppConnect() {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline">
      <div className="text-[10px] font-mono tracking-widest mb-2" style={{ color: 'hsl(var(--ok))' }}>
        CANAL TERRENO · WHATSAPP · INGESTA AUTOMÁTICA
      </div>
      <p className="text-sm font-semibold leading-snug mb-2 text-foreground">
        El capataz no entra a la plataforma: le escribe a GO.
      </p>
      <p className="text-xs leading-relaxed mb-4 text-muted-foreground">
        Cada archivo o foto que recibas por WhatsApp entra al sistema en el momento, asignado a su obra y sin que nadie lo suba a mano.
      </p>

      <div className="space-y-2.5 mb-4">
        {FLUJO.map(({ Icon, t, d }) => (
          <div key={t} className="flex gap-2.5">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface-raised">
              <Icon className="w-3.5 h-3.5" style={{ color: 'hsl(var(--ok))' }} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground">{t}</div>
              <div className="text-[11px] leading-snug text-muted-foreground">{d}</div>
            </div>
          </div>
        ))}
      </div>

      <a href="#whatsapp" onClick={abrirWhatsApp}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'hsl(var(--ok))' }}>
        <MessageCircle className="w-4 h-4" />
        Conectar mi WhatsApp
      </a>
      <p className="text-[10px] leading-relaxed mt-2 text-muted-foreground">
        Se abre el chat con tu cuenta ya vinculada. Cada usuario conecta su número una vez.
      </p>
    </div>
  );
}