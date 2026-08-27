import React from "react";
import Logo from "@/components/marca/Logo";
import { ShieldCheck, FileCheck2, MessagesSquare } from "lucide-react";

const PUNTOS = [
  { icon: FileCheck2, texto: "GO cita la página exacta de tus EETT y la NCh aplicable." },
  { icon: ShieldCheck, texto: "Una NC crítica abierta bloquea el estado de pago. Sin excepciones silenciosas." },
  { icon: MessagesSquare, texto: "Terreno reporta por WhatsApp; la obra queda trazada sola." },
];

// Layout de autenticación split-screen: panel de marca a la izquierda (desktop)
// y formulario limpio a la derecha. Todo cabe sin scroll en pantallas normales.
export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Panel de marca — solo desktop */}
      <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-surface-base border-r border-hairline relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--hairline) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--hairline) / 0.5) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="relative"><Logo /></div>
        <div className="relative max-w-md space-y-7">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight text-foreground">
            El jefe técnico digital de tu obra.
          </h2>
          <div className="space-y-4">
            {PUNTOS.map(({ icon: I, texto }) => (
              <div key={texto} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20">
                  <I className="w-4 h-4 text-primary" />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed pt-1">{texto}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          GOBIM.LAT · CONSTRUCTORAS EN CHILE
        </p>
      </div>

      {/* Panel de formulario */}
      <div
        className="flex items-center justify-center px-4 sm:px-8 py-8"
        style={{
          paddingTop: 'max(2rem, env(safe-area-inset-top))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="w-full max-w-sm min-w-0">
          <div className="lg:hidden flex justify-center mb-8"><Logo /></div>
          <div className="mb-8">
            {Icon && (
              <span className="inline-flex w-10 h-10 rounded-xl items-center justify-center mb-4 bg-primary/10 border border-primary/20">
                <Icon className="w-4.5 h-4.5 text-primary" aria-hidden="true" style={{ width: 18, height: 18 }} />
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-foreground break-words">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1.5 break-words">{subtitle}</p>}
          </div>
          {children}
          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-8 break-words">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}