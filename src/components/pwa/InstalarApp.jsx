import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

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
    <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: '#0A1E4D' }}>
      <Download className="w-4 h-4 text-white flex-shrink-0" />
      <span className="text-xs text-white flex-1 leading-snug">
        Instala Orion en tu celular y úsalo en terreno como app.
      </span>
      <button onClick={instalar} className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0" style={{ background: 'white', color: '#0A1E4D' }}>
        INSTALAR
      </button>
      <button onClick={cerrar} className="text-white/60 p-1 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}