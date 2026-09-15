import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { abrirWhatsApp } from '@/components/agent/WhatsAppConnect';
import WhatsAppTourCard from '@/components/whatsapp/WhatsAppTourCard';

export default function WhatsAppOnboarding() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false), [step, setStep] = useState(0);
  const hasMobileMenu = ['/app', '/vision-urgente', '/dashboard', '/monitor-avance', '/qa-terreno', '/evidencia-terreno', '/gestor-rdi', '/semaforo-pagos', '/centro-alertas', '/informe-ejecutivo', '/base-conocimiento', '/sincronizacion', '/manual-marca', '/configuracion'].includes(pathname);
  useEffect(() => {
    if (sessionStorage.getItem('go-whatsapp-onboarding-seen')) return;
    const timer = window.setTimeout(() => setOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);
  const close = () => { sessionStorage.setItem('go-whatsapp-onboarding-seen', '1'); setOpen(false); };
  const reopen = () => { setStep(0); setOpen(true); };
  return <div className={`fixed right-4 z-[80] flex flex-col items-end gap-3 transition-[bottom] duration-200 lg:bottom-6 lg:right-6 ${hasMobileMenu ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]' : 'bottom-[max(1rem,env(safe-area-inset-bottom))]'}`}>
    {open && <WhatsAppTourCard step={step} setStep={setStep} onClose={close} onConnect={event => { close(); abrirWhatsApp(event); }} />}
    <button onClick={open ? close : reopen} aria-expanded={open} aria-label={open ? 'Cerrar recorrido de WhatsApp' : 'Descubrir GO en WhatsApp'} className="relative flex h-12 w-12 items-center justify-center rounded-full border border-foreground/20 bg-ok text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14">
      {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-ok/35" />}
      <MessageCircle className="h-6 w-6" />
      {!open && <span className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-surface bg-primary px-1 text-[9px] font-bold text-primary-foreground">GO</span>}
    </button>
  </div>;
}