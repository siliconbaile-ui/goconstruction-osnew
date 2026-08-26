import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

const URL_APP = 'https://whatsapptobim.base44.app';
const TEXTO = 'GoConstruction OS: un jefe técnico digital para la obra. Le mandas una foto o un plano por WhatsApp y queda registrado al tiro; después te responde citando la página exacta de las EETT.';

// Compartir la app: hoja nativa del celular (WhatsApp, redes, correo) con la
// vista previa con imagen que ya define el link. Fallback: WhatsApp directo.
export default function CompartirApp() {
  const [listo, setListo] = useState(false);

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GoConstruction OS', text: TEXTO, url: URL_APP });
        return;
      } catch { return; } // usuario canceló la hoja nativa
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${TEXTO}\n${URL_APP}`)}`, '_blank');
    setListo(true);
    setTimeout(() => setListo(false), 1800);
  };

  return (
    <button onClick={compartir} title="Compartir la app por WhatsApp o redes"
      className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-primary transition-colors bg-surface-raised border border-hairline">
      {listo ? <Check className="w-4 h-4" style={{ color: 'hsl(var(--ok))' }} /> : <Share2 className="w-4 h-4" />}
    </button>
  );
}