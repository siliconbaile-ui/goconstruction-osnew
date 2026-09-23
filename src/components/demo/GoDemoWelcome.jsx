import { Play, MessageCircle, ShieldCheck, LayoutDashboard, Camera, Route } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const capacidades = [
  { icon: LayoutDashboard, titulo: 'Consulta y gestiona', texto: 'Avances, riesgos, RDIs, calidad, EDPs e informes. Pídeselo a GO sin recorrer cada módulo.' },
  { icon: Camera, titulo: 'Conecta el terreno', texto: 'Comparte planos, fotos y documentos por el chat o WhatsApp, también desde la obra.' },
  { icon: Route, titulo: 'Descubre cómo funciona', texto: 'El recorrido te muestra los módulos y la trazabilidad detrás de cada respuesta.' },
];

export default function GoDemoWelcome({ onStart, onSkip }) {
  return (
    <Dialog open onOpenChange={open => { if (!open) onSkip(); }}>
      <DialogContent onPointerDownOutside={event => event.preventDefault()} className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 text-card-foreground shadow-2xl sm:rounded-2xl [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center">
        <div className="shrink-0 border-b border-border px-5 py-4 pr-16 sm:px-7 sm:pr-16"><Logo tamano="sm" /></div>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <DialogTitle className="max-w-xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Tu Centro de Comando de obra</DialogTitle>
          <DialogDescription className="mt-2 text-base leading-relaxed">Soy GO, tu jefe técnico digital. Gestiona tu obra desde una conversación.</DialogDescription>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {capacidades.map(({ icon: Icon, titulo, texto }) => <div key={titulo} className="flex gap-3 rounded-xl border border-border bg-muted/40 p-3.5 sm:block sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
              <div className="sm:mt-3"><h2 className="text-sm font-semibold leading-snug">{titulo}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{texto}</p></div>
            </div>)}
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-secondary/60 px-3.5 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground">Los módulos se adaptan a tu empresa. Pagos, cierres de calidad, contratos y decisiones de seguridad mantienen sus controles y validaciones humanas.</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-7">
          <Button onClick={onStart} className="h-11 gap-2 rounded-xl px-5 sm:order-2"><Play className="h-4 w-4" />Comenzar recorrido</Button>
          <Button onClick={onSkip} variant="outline" className="h-11 gap-2 rounded-xl px-5 sm:order-1"><MessageCircle className="h-4 w-4" />Conocer a GO</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}