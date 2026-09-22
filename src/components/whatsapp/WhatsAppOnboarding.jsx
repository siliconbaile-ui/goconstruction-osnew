import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WhatsAppConnectLink from '@/components/whatsapp/WhatsAppConnectLink';
import WhatsAppTourCard from '@/components/whatsapp/WhatsAppTourCard';
import WhatsAppMobileSheet from '@/components/whatsapp/WhatsAppMobileSheet';

export default function WhatsAppOnboarding() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false), [step, setStep] = useState(0);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches);
  const hasMobileMenu = ['/app', '/asistente', '/vision-urgente', '/dashboard', '/monitor-avance', '/qa-terreno', '/evidencia-terreno', '/gestor-rdi', '/semaforo-pagos', '/centro-alertas', '/informe-ejecutivo', '/base-conocimiento', '/sincronizacion', '/manual-marca', '/configuracion'].includes(pathname);
  const isAccess = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/onboarding', '/polpaico-os'].includes(pathname);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const change = () => setMobile(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (isAccess) { setOpen(false); return; }
    if (sessionStorage.getItem('go-whatsapp-onboarding-seen')) return;
    const timer = window.setTimeout(() => { setStep(0); setOpen(true); }, 1400);
    return () => window.clearTimeout(timer);
  }, [pathname, isAccess]);
  const remember = () => sessionStorage.setItem('go-whatsapp-onboarding-seen', '1');
  const close = () => { remember(); setOpen(false); };
  if (isAccess) return null;
  return <>
    {mobile && <WhatsAppMobileSheet open={open} step={step} setStep={setStep} onClose={close} onConnect={remember} />}
    <div className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6 ${mobile && (open || hasMobileMenu) ? 'hidden' : ''}`}>
      {!mobile && open && <WhatsAppTourCard step={step} setStep={setStep} onClose={close} onConnect={remember} />}
      {!open && <WhatsAppConnectLink onOpen={remember} className="rounded-full border border-foreground/10 bg-ok px-4 text-sm text-primary-foreground shadow-lg">WhatsApp</WhatsAppConnectLink>}
    </div>
  </>;
}