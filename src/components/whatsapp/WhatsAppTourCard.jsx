import { ArrowRight, Camera, FileText, MapPin, MessageCircle, X } from 'lucide-react';
import WhatsAppSimulation from '@/components/whatsapp/WhatsAppSimulation';

const steps = [
  { eyebrow: 'GO TAMBIÉN VIVE EN TERRENO', title: 'Opera la plataforma desde WhatsApp', text: 'Presiona aquí y comprueba cómo el equipo puede conversar con GO sin aprender otra aplicación.', items: [] },
  { eyebrow: 'DEL CHAT A LA TRAZABILIDAD', title: 'Una conversación se convierte en gestión', text: 'GO interpreta lo recibido, lo vincula a la obra y mantiene evidencia para revisar cada decisión.', items: [[Camera, 'Fotos y notas desde terreno'], [FileText, 'Planos, EETT y contratos'], [MapPin, 'Obra, ubicación y responsable']] },
];
export default function WhatsAppTourCard({ step, setStep, onClose, onConnect }) {
  if (step === 2) return <div className="w-[min(24rem,calc(100vw-1.5rem))] rounded-3xl border border-hairline bg-surface p-5 shadow-2xl"><WhatsAppSimulation onBack={() => setStep(1)} /></div>;
  const current = steps[step];
  return <section aria-live="polite" aria-label="Recorrido de WhatsApp" className="w-[min(24rem,calc(100vw-1.5rem))] rounded-3xl border border-hairline bg-surface p-5 shadow-2xl">
    <div className="mb-4 flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ok text-primary-foreground"><MessageCircle className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-mono tracking-widest text-ok">{current.eyebrow}</p><h2 className="mt-1 text-lg font-semibold leading-tight">{current.title}</h2></div><button onClick={onClose} aria-label="Cerrar recorrido" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-raised"><X className="h-4 w-4" /></button></div>
    <p className="text-sm leading-relaxed text-muted-foreground">{current.text}</p>
    {current.items.length > 0 && <div className="my-4 space-y-2">{current.items.map(([Icon, label]) => <div key={label} className="flex items-center gap-3 rounded-xl bg-surface-raised p-3 text-xs"><Icon className="h-4 w-4 text-ok" />{label}</div>)}</div>}
    <div className="mt-5 flex gap-2">{step === 0 ? <button onClick={() => setStep(1)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ok px-4 text-sm font-semibold text-primary-foreground">Ver cómo funciona<ArrowRight className="h-4 w-4" /></button> : <><button onClick={() => setStep(2)} className="min-h-11 flex-1 rounded-full bg-surface-raised px-3 text-xs font-semibold">Ver simulación</button><button onClick={onConnect} className="min-h-11 flex-1 rounded-full bg-ok px-3 text-xs font-semibold text-primary-foreground">Conectar WhatsApp</button></>}</div>
    <div className="mt-4 flex justify-center gap-1.5">{steps.map((_, index) => <span key={index} className={`h-1.5 rounded-full ${index === step ? 'w-5 bg-ok' : 'w-1.5 bg-hairline'}`} />)}</div>
  </section>;
}