import { Play, MessageCircle, ShieldCheck, LayoutDashboard, Camera, Route } from 'lucide-react';
import Logo from '@/components/marca/Logo';

export default function GoDemoWelcome({ onStart, onSkip }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 p-3 backdrop-blur-sm sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="go-welcome-title" aria-describedby="go-welcome-description" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-hairline bg-surface text-foreground shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Logo tamano="sm" />
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">Bienvenido a GO</span>
          </div>
          <h1 id="go-welcome-title" className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Tu Centro de Comando de obra</h1>
          <p id="go-welcome-description" className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Soy GO, tu jefe técnico digital. Consulta, coordina y actúa desde una conversación, sin recorrer decenas de pantallas.</p>
          <div className="my-5 grid gap-2.5 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-hairline bg-surface-raised/60 p-3.5 sm:block">
              <LayoutDashboard className="h-5 w-5 shrink-0 text-primary sm:mb-3" aria-hidden="true" />
              <div><h2 className="text-sm font-semibold">Controla tu obra</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Avances, riesgos, RDIs, calidad, EDPs e informes en un solo lugar.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-hairline bg-surface-raised/60 p-3.5 sm:block">
              <Camera className="h-5 w-5 shrink-0 text-primary sm:mb-3" aria-hidden="true" />
              <div><h2 className="text-sm font-semibold">Conecta el terreno</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Comparte planos, fotos y documentos por chat o WhatsApp, vinculados a tu obra.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-hairline bg-surface-raised/60 p-3.5 sm:block">
              <Route className="h-5 w-5 shrink-0 text-primary sm:mb-3" aria-hidden="true" />
              <div><h2 className="text-sm font-semibold">Descubre cómo funciona</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Recorre los módulos y conoce la trazabilidad detrás de cada respuesta.</p></div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p><span className="font-semibold text-foreground">Tú mantienes el control.</span> Los módulos se adaptan a tu empresa. Pagos, cierres de calidad, cambios contractuales y decisiones de seguridad conservan sus validaciones humanas.</p>
          </div>
        </div>
        <footer className="flex shrink-0 flex-col gap-2 border-t border-hairline bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="hidden max-w-[13rem] text-xs leading-relaxed text-muted-foreground sm:block">El recorrido comienza aquí,<br />en tu Centro de Comando.</p>
          <div className="flex flex-col gap-2 min-[380px]:flex-row sm:gap-3">
            <button onClick={onStart} className="order-first flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:order-last"><Play className="h-4 w-4" aria-hidden="true" />Comenzar recorrido</button>
            <button onClick={onSkip} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"><MessageCircle className="h-4 w-4" aria-hidden="true" />Conocer a GO</button>
          </div>
        </footer>
      </section>
    </div>
  );
}