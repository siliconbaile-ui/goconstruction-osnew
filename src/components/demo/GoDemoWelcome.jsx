import { Play, MessageCircle, ShieldCheck } from 'lucide-react';
import Logo from '@/components/marca/Logo';

export default function GoDemoWelcome({ onStart, onSkip }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-lg rounded-3xl border border-primary/30 bg-surface p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex justify-center"><Logo /></div>
        <div className="mb-5 text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Tu Centro de Comando de obra</h1>
          <p className="mt-1.5 text-sm font-medium text-primary">Hola, soy GO, el jefe técnico digital de GoConstruction OS.</p>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Este chat es tu punto central de operación. Desde aquí puedes consultar el estado de la obra, revisar avances, detectar riesgos, cargar planos y evidencias, gestionar RDIs, controlar no conformidades, validar EDPs y generar informes, sin recorrer decenas de pantallas.</p>
          <p>La misma lógica conversacional está disponible en WhatsApp, una de mis extremidades operativas: puedes enviar consultas, fotografías y documentos desde terreno, y la información quedará vinculada a la obra correspondiente.</p>
          <p>Durante esta demo también recorreremos el backend para mostrar los módulos activos y la trazabilidad que existe detrás de cada respuesta. No necesitas aprender cada pantalla: puedes pedirme por chat o WhatsApp que encuentre la información, prepare una acción o te lleve al módulo correcto.</p>
          <p className="flex items-start gap-2 text-foreground/70">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <span>Los módulos pueden habilitarse o configurarse según la operación de cada empresa. Las acciones sensibles —pagos, cierres de calidad, cambios contractuales o decisiones de seguridad— siempre conservan sus controles y validaciones humanas.</span>
          </p>
        </div>
        <p className="mt-4 text-center text-xs font-semibold text-primary">Este Centro de Comando es la primera capacidad del recorrido.</p>
        <div className="mt-6 space-y-3">
          <button onClick={onStart} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80">
            <Play className="h-5 w-5" />
            Comenzar recorrido
          </button>
          <button onClick={onSkip} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface-raised px-4 text-sm font-medium text-foreground/70">
            <MessageCircle className="h-4 w-4" />
            Conocer a GO
          </button>
        </div>
      </div>
    </div>
  );
}