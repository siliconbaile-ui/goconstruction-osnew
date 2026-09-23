import Logo from '@/components/marca/Logo';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface-base px-4 py-8">
    <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(hsl(var(--hairline) / 0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--hairline) / 0.55) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
    <div aria-hidden="true" className="sphere-1" /><div aria-hidden="true" className="sphere-2" />
    <div aria-hidden="true" className="absolute left-6 right-6 top-6 hidden items-center justify-between rounded-2xl border border-hairline bg-surface/60 px-5 py-3 backdrop-blur md:flex"><Logo tamano="sm" /><span className="font-mono text-[10px] tracking-widest text-ok">GO · SISTEMA OPERATIVO</span></div>
    <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative z-10 w-full max-w-lg rounded-3xl border border-foreground/10 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
      <div className="mb-5 flex justify-center"><Logo /></div>
      <div className="mb-5 text-center">
        {Icon && <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><Icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" /></span>}
        <h1 id="auth-title" className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
      {footer && <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>}
      <p className="mt-5 flex items-center justify-center gap-2 border-t border-hairline pt-4 text-[10px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-ok" />Acceso seguro · demo con cuenta personal</p>
    </section>
  </main>;
}