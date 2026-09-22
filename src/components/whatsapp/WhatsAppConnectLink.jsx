import { MessageCircle } from 'lucide-react';
import { GO_WHATSAPP_URL } from '@/components/whatsapp/goWhatsApp';

export default function WhatsAppConnectLink({ children = 'Conversar con GO', className = '', onOpen, iconOnly = false }) {
  const connect = event => {
    event.currentTarget.target = window.matchMedia('(max-width: 1023px)').matches ? '_self' : '_blank';
    onOpen?.();
  };
  return <a href={GO_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={connect} aria-label={iconOnly ? 'Conversar con GO por WhatsApp' : undefined} className={`inline-flex min-h-12 min-w-12 touch-manipulation items-center justify-center gap-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-80 ${className} !bg-ok !text-primary-foreground hover:!bg-ok/90`}>
    <MessageCircle className="h-5 w-5 shrink-0" />
    {!iconOnly && <span>{children}</span>}
  </a>;
}