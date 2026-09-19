import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import WhatsAppConnectLink from '@/components/whatsapp/WhatsAppConnectLink';

export default function PublicStart() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface-base px-4 py-8">
      <div aria-hidden="true" className="sphere-1" />
      <div aria-hidden="true" className="sphere-2" />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-foreground/10 bg-surface/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-7 flex justify-center"><Logo /></div>
        <div className="mb-7 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary">BIENVENIDO A GO</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Elige cómo comenzar</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Crea tu perfil para operar en la plataforma o continúa directamente por WhatsApp.</p>
        </div>
        <div className="space-y-3">
          <Link to="/register" className="flex min-h-16 items-center gap-3 rounded-2xl bg-primary px-4 text-primary-foreground transition-opacity active:opacity-80">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15"><UserPlus className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Crear mi acceso</span><span className="block text-xs opacity-80">Nombre, teléfono, cargo, empresa y correo</span></span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
          <WhatsAppConnectLink className="w-full min-h-16 justify-start gap-3 rounded-2xl px-4">
            <span className="text-left"><span className="block text-sm font-semibold">Avanzar por WhatsApp</span><span className="block text-xs opacity-85">Habla con GO desde tu teléfono</span></span>
          </WhatsAppConnectLink>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-primary hover:underline">Entrar</Link></p>
      </section>
    </main>
  );
}