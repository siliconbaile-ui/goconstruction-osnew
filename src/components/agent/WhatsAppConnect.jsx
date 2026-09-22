import { GO_WHATSAPP_URL } from '@/components/whatsapp/goWhatsApp';
import WhatsAppInvite from '@/components/whatsapp/WhatsAppInvite';
import { Camera, FileText, MapPin } from 'lucide-react';
import WhatsAppConnectLink from '@/components/whatsapp/WhatsAppConnectLink';

const url = () => GO_WHATSAPP_URL;

// Compatibilidad con otros accesos: una sola navegación, sin ventanas emergentes.
export const abrirWhatsApp = (e) => {
  e?.preventDefault();
  window.location.assign(url());
};

export function WhatsAppButton() {
  return <WhatsAppConnectLink className="shrink-0 rounded-full bg-ok/15 px-3 text-xs text-ok sm:min-h-10">WhatsApp</WhatsAppConnectLink>;
}

const FLUJO = [
  { Icon: Camera, t: 'Foto o nota de terreno', d: 'Parte por lo observable. El registro requiere obra identificada, herramientas habilitadas y permisos efectivos.' },
  { Icon: FileText, t: 'Plano, EETT o contrato', d: 'Contrasta evidencia disponible; las citas y páginas se confirman con las fuentes recuperadas.' },
  { Icon: MapPin, t: 'Obra y contexto', d: 'Indica la obra y el problema urgente. Compartir un enlace no concede permisos sobre la obra.' },
];

export default function WhatsAppConnect() {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline">
      <div className="text-[10px] font-mono tracking-widest mb-2" style={{ color: 'hsl(var(--ok))' }}>
        CANAL TERRENO · CONVERSA CON GO
      </div>
      <p className="text-sm font-semibold leading-snug mb-2 text-foreground">
        El capataz no entra a la plataforma: le escribe a GO.
      </p>
      <p className="text-xs leading-relaxed mb-4 text-muted-foreground">
        Empieza directamente por WhatsApp, sin registro previo. Las consultas y gestiones sobre registros privados mantienen sus permisos y validaciones.
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

      <WhatsAppConnectLink className="w-full bg-ok px-4 text-sm text-primary-foreground">Conversar con GO</WhatsAppConnectLink>
      <p className="my-3 text-sm leading-relaxed text-muted-foreground">Envía el mensaje preparado y continúa en el mismo chat. No necesitas abrir la plataforma para comenzar.</p>
      <WhatsAppInvite />
    </div>
  );
}