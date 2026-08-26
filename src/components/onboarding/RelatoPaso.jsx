import Logo from '@/components/marca/Logo';

// Relato de marca del onboarding: cada paso explica en una línea qué gana la
// constructora al completarlo, para que nunca se sienta un formulario ciego.
const RELATO = {
  1: {
    titulo: 'Incorpora tu constructora',
    bajada: 'Con la razón social queda creada tu cuenta de empresa: desde aquí GO opera tus obras.',
  },
  2: {
    titulo: 'Tu equipo en la obra',
    bajada: 'Tu cargo define cómo te habla GO: terreno recibe qué hacer hoy, gerencia recibe plata y plazo.',
  },
  3: {
    titulo: 'Tu primera obra',
    bajada: 'Con una obra activa GO ya puede leer avance, calidad, RDIs y pagos, y avisarte antes de que duela.',
  },
};

export default function RelatoPaso({ paso, total, soloCargo, empresa }) {
  const relato = RELATO[paso] || RELATO[1];
  return (
    <div className="text-center pt-2">
      <div className="flex justify-center mb-3"><Logo size="md" /></div>
      <p className="text-[10px] font-mono tracking-[0.2em] text-primary mb-1.5">
        {soloCargo ? 'ACCESO AL EQUIPO' : `PASO ${paso} DE ${total}`}
      </p>
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">
        {soloCargo ? `Bienvenido a ${empresa?.nombre || 'tu constructora'}` : relato.titulo}
      </h1>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
        {soloCargo ? 'Declara tu cargo en obra y entras a operar de inmediato.' : relato.bajada}
      </p>
    </div>
  );
}