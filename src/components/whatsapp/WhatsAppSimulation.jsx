import { ArrowLeft, Camera, MessageCircle } from 'lucide-react';
import draft from '@/components/whatsapp/goOnboardingDraft.json';

const messages = [
  { side: 'go', icon: MessageCircle, text: draft.whatsapp_greeting },
  { side: 'user', icon: Camera, text: 'En la obra de este ejemplo apareció una fisura en el muro del eje B.' },
  { side: 'go', icon: MessageCircle, text: 'Entiendo: fisura en el muro del eje B. Para empezar por lo observable, ¿puedes enviar una foto general del sector, sin datos personales?' },
  { side: 'user', icon: Camera, text: 'Voy a tomarla.' },
  { side: 'go', icon: MessageCircle, text: 'Envíala aquí cuando la tengas. El siguiente paso es revisar lo visible y qué antecedente técnico falta; una foto no permite certificar estabilidad ni cerrar una NC.' },
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
    <p className="text-[11px] leading-relaxed text-muted-foreground">Propuesta de conversación, no respuesta real del canal. No envía mensajes ni guarda registros. La respuesta automática del número Kapso necesita un puente verificado con GO.</p>
  </div>;
}