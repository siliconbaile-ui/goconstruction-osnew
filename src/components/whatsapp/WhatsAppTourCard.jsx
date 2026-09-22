import { Camera, FileText, MapPin, MessageCircle, X } from 'lucide-react';
import WhatsAppSimulation from '@/components/whatsapp/WhatsAppSimulation';
import WhatsAppConnectLink from '@/components/whatsapp/WhatsAppConnectLink';

export default function WhatsAppTourCard({ step, setStep, onClose, onConnect, mobile = false }) {
  return <section aria-label="Conectar GO a WhatsApp" className={mobile ? 'flex min-h-0 flex-1 flex-col text-foreground' : 'flex max-h-[85dvh] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-hairline bg-surface text-foreground shadow-2xl'}>
    <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ok/15 text-ok"><MessageCircle className="h-6 w-6" /></span>
      <div className="min-w-0 flex-1"><p className="text-xs font-medium text-ok">GO en terreno</p><h2 className="mt-1 text-xl font-semibold leading-tight">Lleva GO a tu WhatsApp</h2></div>
      <button type="button" onClick={onClose} aria-label="Cerrar recorrido" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring active:bg-surface-raised"><X className="h-5 w-5" /></button>
    </header>
    <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-4" data-vaul-no-drag>
      {step === 2 ? <WhatsAppSimulation onBack={() => setStep(0)} /> : <>
        <p className="text-base leading-relaxed text-muted-foreground">Cuéntale a GO en qué obra estás y qué urge resolver. Abre WhatsApp y envía el mensaje preparado; no necesitas crear una cuenta.</p>
        {step === 1 && <div className="mt-4 space-y-3">{[[Camera, 'Comparte fotos y notas de terreno'], [FileText, 'Consulta documentos con GO'], [MapPin, 'Indica la obra y el sector']].map(([Icon, text]) => <div key={text} className="flex items-center gap-3 rounded-xl bg-surface-raised p-3 text-sm"><Icon className="h-5 w-5 shrink-0 text-ok" />{text}</div>)}<p className="mt-3 text-sm text-muted-foreground">Revisa con GO la obra y los permisos antes de registrar información.</p></div>}
      </>}
    </div>
    <footer className="shrink-0 space-y-2 border-t border-hairline bg-surface px-5 pb-5 pt-4">
      <WhatsAppConnectLink onOpen={onConnect} className="min-h-14 w-full bg-ok px-4 text-base text-primary-foreground">Conversar con GO</WhatsAppConnectLink>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">Continúa con GO en el mismo chat. Registro en la plataforma: opcional.</p>
      {step !== 2 && <div className="flex gap-2"><button type="button" onClick={() => setStep(step === 1 ? 0 : 1)} className="min-h-12 flex-1 rounded-xl px-2 text-sm text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring active:bg-surface-raised">{step === 1 ? 'Ver menos' : 'Cómo funciona'}</button><button type="button" onClick={() => setStep(2)} className="min-h-12 flex-1 rounded-xl px-2 text-sm text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring active:bg-surface-raised">Ver ejemplo</button></div>}
    </footer>
  </section>;
}