import { useState } from 'react';
import { Download, Link2, Check, Loader2 } from 'lucide-react';

export const ASSETS = [
  { id: 'isotipo-oscuro', nombre: 'Isotipo · fondo oscuro', uso: 'App, favicon, avatar de WhatsApp y redes', fondo: '#0B0908', url: 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/08dbc115f_generated_image.png' },
  { id: 'isotipo-claro', nombre: 'Isotipo · fondo claro', uso: 'Documentos, EDPs impresos, fondos blancos', fondo: '#FFFFFF', url: 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/a9917133a_generated_image.png' },
  { id: 'horizontal-oscuro', nombre: 'Logo horizontal · oscuro', uso: 'Headers, firmas de correo, presentaciones', fondo: '#0B0908', ancho: true, url: 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/3887e82b9_generated_image.png' },
  { id: 'horizontal-claro', nombre: 'Logo horizontal · claro', uso: 'Informes ejecutivos, papelería, web clara', fondo: '#FFFFFF', ancho: true, url: 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/bfaa02e3f_generated_image.png' },
  { id: 'monocromo-blanco', nombre: 'Monocromo · blanco', uso: 'Timbres, bordados, cascos, un solo color', fondo: '#0B0908', url: 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/65efc5cc6_generated_image.png' },
  { id: 'social-1200x630', nombre: 'Imagen para compartir · 1200×630', uso: 'Vista previa del link en WhatsApp, LinkedIn y redes', fondo: '#0B0908', ancho: true, url: 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/e3fc0c4dc_generated_image.png' },
];

async function descargar(asset, setEstado) {
  setEstado('bajando');
  try {
    const res = await fetch(asset.url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `goconstruction-os-${asset.id}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
    setEstado('listo');
  } catch {
    window.open(asset.url, '_blank');
    setEstado(null);
    return;
  }
  setTimeout(() => setEstado(null), 1800);
}

function TarjetaAsset({ asset }) {
  const [estado, setEstado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const copiarUrl = async () => {
    await navigator.clipboard.writeText(asset.url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-surface border border-hairline flex flex-col">
      <div className="h-32 flex items-center justify-center p-4" style={{ background: asset.fondo }}>
        <img src={asset.url} alt={asset.nombre} loading="lazy"
          className={asset.ancho ? 'max-h-full max-w-full object-contain' : 'h-full object-contain rounded-lg'} />
      </div>
      <div className="p-3.5 flex-1 flex flex-col gap-1">
        <div className="text-xs font-semibold text-foreground">{asset.nombre}</div>
        <p className="text-[11px] leading-snug text-muted-foreground flex-1">{asset.uso}</p>
        <div className="flex gap-1.5 mt-2">
          <button onClick={() => descargar(asset, setEstado)}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground">
            {estado === 'bajando' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : estado === 'listo' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            PNG
          </button>
          <button onClick={copiarUrl} title="Copiar URL pública del asset"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-raised border border-hairline text-muted-foreground">
            {copiado ? <Check className="w-3.5 h-3.5" style={{ color: 'hsl(var(--ok))' }} /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Kit de marca descargable: todas las variantes del logo con URL pública estable.
export default function KitDescargas() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ASSETS.map(a => <TarjetaAsset key={a.id} asset={a} />)}
    </div>
  );
}