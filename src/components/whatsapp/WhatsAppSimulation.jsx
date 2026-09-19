import { ArrowLeft, Camera, CheckCircle2, MapPin } from 'lucide-react';

const messages = [
  { side: 'user', icon: Camera, text: 'GO, encontré una fisura en el muro del eje B. Te envío la foto.' },
  { side: 'go', icon: MapPin, text: 'Evidencia recibida con ubicación. Preparé la inspección y marqué revisión prioritaria.' },
  { side: 'go', icon: CheckCircle2, text: 'Quedó trazabilidad para calidad, responsable y cierre. Nada se pierde en el chat.' },
];

export default function WhatsAppSimulation({ onBack }) {
  return <div className="space-y-3">
    <button onClick={onBack} className="flex min-h-12 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" />Volver</button>
    <div className="rounded-2xl bg-surface-base p-3 space-y-2">
      {messages.map(({ side, icon: Icon, text }, index) => <div key={index} className={`flex gap-2 ${side === 'user' ? 'ml-7 justify-end' : 'mr-7'}`}>
        <div className={`rounded-2xl p-3 text-sm leading-relaxed ${side === 'user' ? 'bg-ok text-primary-foreground rounded-tr-sm' : 'bg-surface-raised text-foreground rounded-tl-sm'}`}>
          <Icon className="mb-1.5 h-4 w-4" />{text}
        </div>
      </div>)}
    </div>
    <p className="text-[11px] leading-relaxed text-muted-foreground">Simulación ilustrativa: en una obra conectada, GO procesa mensajes, archivos y evidencia según los permisos configurados.</p>
  </div>;
}