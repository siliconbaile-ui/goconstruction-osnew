import { Link } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import { safeReturnTo } from '@/lib/authReturnTo';

const steps = ['Tu acceso', 'Tu perfil', 'Verificación'];
export default function RegisterLayout({ step, children }) {
  const returnTo = safeReturnTo();
  return <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-5 sm:p-8">
    <section aria-label="Crear cuenta" className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:grid md:grid-cols-[0.8fr_1.2fr]">
      <aside className="border-b border-border bg-secondary/40 p-5 md:border-b-0 md:border-r md:p-8">
        <Link to="/" aria-label="Ir al inicio" className="inline-flex"><Logo tamano="sm" /></Link>
        <div className="hidden md:block"><p className="mt-10 text-xs font-medium uppercase tracking-widest text-primary">Empieza con GO</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">Tu obra.<br />Todo en un lugar.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Crea tu acceso y entra al asistente de tu obra.</p></div>
        <ol aria-label="Progreso del registro" className="mt-4 flex justify-between gap-2 md:mt-8 md:flex-col md:gap-4">
          {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`flex items-center gap-2 text-xs md:text-sm ${step === index ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${step >= index ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{step > index ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>{label}</li>)}
        </ol>
      </aside>
      <div className="min-w-0 p-5 sm:p-7 md:p-8">
        {children}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Acceso seguro</span>
          <span>¿Ya tienes cuenta? <Link className="inline-flex min-h-11 items-center font-medium text-primary hover:underline" to={'/login' + (returnTo !== '/' ? '?returnTo=' + encodeURIComponent(returnTo) : '')}>Entrar</Link></span>
        </div>
      </div>
    </section>
  </main>;
}