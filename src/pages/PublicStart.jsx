import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import WhatsAppConnectLink from '@/components/whatsapp/WhatsAppConnectLink';
import WhatsAppInvite from '@/components/whatsapp/WhatsAppInvite';
import { GO_WHATSAPP_DISPLAY } from '@/components/whatsapp/goWhatsApp';

export default function PublicStart() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface-base px-4 py-8">
      <div aria-hidden="true" className="sphere-1" />
      <div aria-hidden="true" className="sphere-2" />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-foreground/10 bg-surface/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-7 flex justify-center"><Logo /></div>
        <div className="mb-7 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary">BIENVENIDO A GO</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Tu obra empieza con una conversación</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Cuéntale a GO en qué obra estás y qué urge resolver. Comienza por WhatsApp, sin crear una cuenta.</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Fotos y notas de voz como punto de partida; planos, EETT, avance, NC, RDI y pagos según las herramientas y permisos habilitados.</p>
        </div>
        <div className="space-y-3">
          <Link to="/app" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Iniciar con la app <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-center text-xs text-muted-foreground">¿Prefieres empezar sin cuenta? Conversa por WhatsApp.</p>
          <WhatsAppConnectLink className="w-full min-h-16 justify-start gap-3 rounded-2xl px-4">
            <span className="text-left"><span className="block text-sm font-semibold">Conversar con GO por WhatsApp</span><span className="block text-xs opacity-85">{GO_WHATSAPP_DISPLAY} · Sin registro previo</span></span>
          </WhatsAppConnectLink>
          <p className="text-center text-xs text-muted-foreground">Abre el chat, edita el mensaje si quieres y envíalo.</p>
          <WhatsAppInvite />
          <Link to="/register" className="flex min-h-14 items-center gap-3 rounded-2xl border border-hairline bg-surface-raised px-4 text-foreground transition-opacity active:opacity-80">
            <UserPlus className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Prefiero crear mi acceso</span><span className="block text-xs text-muted-foreground">Alternativa para operar dentro de la plataforma</span></span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-primary hover:underline">Entrar</Link></p>
      </section>
    </main>
  );
}