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
  const position = hasMobileMenu
    ? open
      ? 'inset-0 items-center justify-center bg-surface-base/75 p-3 backdrop-blur-sm lg:inset-auto lg:bottom-6 lg:right-6 lg:items-end lg:justify-end lg:bg-transparent lg:p-0 lg:backdrop-blur-none'
      : 'hidden lg:flex lg:bottom-6 lg:right-6'
    : 'bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:right-5';
  return <div className={`fixed z-[80] flex flex-col gap-3 ${position}`}>
    {open && <WhatsAppTourCard step={step} setStep={setStep} onClose={close} onConnect={event => { close(); abrirWhatsApp(event); }} />}
    <button onClick={open ? close : reopen} aria-expanded={open} aria-label={open ? 'Cerrar recorrido de WhatsApp' : 'Descubrir GO en WhatsApp'} className={`relative h-12 w-12 items-center justify-center rounded-full border border-foreground/20 bg-ok text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14 ${hasMobileMenu ? 'hidden lg:flex' : 'flex'}`}>
      {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-ok/35" />}
      <MessageCircle className="h-6 w-6" />
      {!open && <span className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-surface bg-primary px-1 text-[9px] font-bold text-primary-foreground">GO</span>}
    </button>
  </div>;
}