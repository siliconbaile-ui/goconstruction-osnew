import { base44 } from '@/api/base44Client';
import { Camera, FileText, MapPin } from 'lucide-react';
import WhatsAppConnectLink from '@/components/whatsapp/WhatsAppConnectLink';

const url = () => base44.agents.getWhatsAppConnectURL('orion_asistente');

// Compatibilidad con otros accesos: una sola navegación, sin ventanas emergentes.
export const abrirWhatsApp = (e) => {
  e?.preventDefault();
  window.location.assign(url());
};

export function WhatsAppButton() {
  return <WhatsAppConnectLink className="shrink-0 rounded-full bg-ok/15 px-3 text-xs text-ok sm:min-h-10">WhatsApp</WhatsAppConnectLink>;
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

      <WhatsAppConnectLink className="w-full bg-ok px-4 text-sm text-primary-foreground">Conectar mi WhatsApp</WhatsAppConnectLink>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Abre WhatsApp y envía el mensaje de conexión que aparece preparado. Si se solicita, inicia sesión para vincular tu cuenta.
      </p>
    </div>
  );
}