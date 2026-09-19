import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import WhatsAppTourCard from '@/components/whatsapp/WhatsAppTourCard';

export default function WhatsAppMobileSheet({ open, step, setStep, onClose, onConnect }) {
  return <Drawer open={open} onOpenChange={value => { if (!value) onClose(); }} shouldScaleBackground={false}>
    <DrawerContent className="max-h-[90dvh] overflow-hidden rounded-t-3xl border-hairline bg-surface pb-[env(safe-area-inset-bottom)]">
      <DrawerTitle className="sr-only">Conectar GO a WhatsApp</DrawerTitle>
      <DrawerDescription className="sr-only">Abre WhatsApp y envía el mensaje preparado. Puedes cerrar este panel o deslizarlo hacia abajo.</DrawerDescription>
      <WhatsAppTourCard mobile step={step} setStep={setStep} onClose={onClose} onConnect={onConnect} />
    </DrawerContent>
  </Drawer>;
}