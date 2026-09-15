import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { abrirWhatsApp } from '@/components/agent/WhatsAppConnect';
import WhatsAppTourCard from '@/components/whatsapp/WhatsAppTourCard';

export default function WhatsAppOnboarding() {
  const [open, setOpen] = useState(false), [step, setStep] = useState(0);
  useEffect(() => {
    if (sessionStorage.getItem('go-whatsapp-onboarding-seen')) return;
    const timer = window.setTimeout(() => setOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);
  const close = () => { sessionStorage.setItem('go-whatsapp-onboarding-seen', '1'); setOpen(false); };
  const reopen = () => { setStep(0); setOpen(true); };
  return <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[80] flex flex-col items-end gap-3 sm:right-5">
    {open && <WhatsAppTourCard step={step} setStep={setStep} onClose={close} onConnect={event => { close(); abrirWhatsApp(event); }} />}
    <button onClick={open ? close : reopen} aria-expanded={open} aria-label={open ? 'Cerrar recorrido de WhatsApp' : 'Descubrir GO en WhatsApp'} className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ok text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95">
      {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-ok/35" />}
      <MessageCircle className="h-6 w-6" />
      {!open && <span className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-surface bg-primary px-1 text-[9px] font-bold text-primary-foreground">GO</span>}
    </button>
  </div>;
}