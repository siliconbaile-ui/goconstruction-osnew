import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const LOGO = 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/08dbc115f_generated_image.png';

// Barra de instalación de la PWA (Android/desktop). En iOS se instala vía "Compartir → Agregar a inicio".
export default function InstalarApp() {
  const [evento, setEvento] = useState(null);
  const [oculto, setOculto] = useState(() => localStorage.getItem('orion_install_off') === '1');

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setEvento(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!evento || oculto) return null;

  const instalar = async () => {
    evento.prompt();
    await evento.userChoice;
    setEvento(null);
  };

  const cerrar = () => { localStorage.setItem('orion_install_off', '1'); setOculto(true); };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border-b border-hairline">
      <img src={LOGO} alt="GO" className="w-7 h-7 rounded-lg flex-shrink-0 ring-1 ring-hairline" />
      <span className="text-xs flex-1 leading-snug text-foreground">
        Instala <strong>GoConstruction OS</strong> en tu celular: GO en terreno, con notificaciones de obra.
      </span>
      <button onClick={instalar}
        className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[11px] font-semibold flex-shrink-0 bg-primary text-primary-foreground">
        <Download className="w-3.5 h-3.5" /> INSTALAR
      </button>
      <button onClick={cerrar} className="text-muted-foreground p-1 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}