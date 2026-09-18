import { Image } from '@/components/ui/image';

const statuses = { pending: 'Pendiente', sent: 'Enviado', delivered: 'Entregado', read: 'Leído', failed: 'Falló' };
export default function KapsoMessage({ message: m }) {
  const outgoing = m.kapso?.direction === 'outbound';
  const rawUrl = m.kapso?.media_url || m.kapso?.media_data?.url;
  const url = typeof rawUrl === 'string' && rawUrl.startsWith('https://') ? rawUrl : null;
  const location = m.location || (m.type === 'location' ? m.kapso?.message_type_data : null);
  const coords = location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude) && Math.abs(location.latitude) <= 90 && Math.abs(location.longitude) <= 180;
  const text = m.text?.body || m[m.type]?.caption || (typeof m.kapso?.content === 'string' ? m.kapso.content : '');
  const timestamp = /^\d+$/.test(String(m.timestamp)) ? Number(m.timestamp) * 1000 : m.timestamp;
  const date = new Date(timestamp);
  return <article className={`max-w-[92%] rounded-xl border p-3 space-y-2 ${outgoing ? 'ml-auto bg-primary/10 border-primary/20' : 'mr-auto bg-surface-raised border-border'}`}>
    <div className="text-xs text-muted-foreground">{outgoing ? 'Equipo' : m.kapso?.contact_name || 'Trabajador'} · {m.type}</div>
    {text && <p className="whitespace-pre-wrap break-words text-sm">{text}</p>}
    {url && m.type === 'image' && <Image src={url} alt={m.image?.caption || 'Imagen recibida por WhatsApp'} className="h-52 w-full rounded-lg object-contain" fittingType="fit" />}
    {url && m.type === 'audio' && <audio controls preload="none" src={url} className="max-w-full" aria-label="Audio de WhatsApp" />}
    {url && m.type === 'video' && <video controls preload="metadata" src={url} className="max-h-60 max-w-full" aria-label="Video de WhatsApp" />}
    {url && <a href={url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline">Abrir {m.document?.filename || 'archivo original'}</a>}
    {!url && ['image', 'audio', 'video', 'document', 'sticker'].includes(m.type) && <p className="text-xs text-muted-foreground">Archivo no disponible en el historial de Kapso.</p>}
    {coords && <div className="text-sm space-y-1"><p>{location.name || 'Ubicación compartida'}{location.address ? ` · ${location.address}` : ''}</p><p className="font-mono">{location.latitude}, {location.longitude}</p><a className="text-primary underline" href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`} target="_blank" rel="noopener noreferrer">Ver en mapa</a><p className="text-xs text-muted-foreground">Precisión no informada. No acredita el lugar de captura de una foto.</p></div>}
    {!text && !url && !coords && !['image', 'audio', 'video', 'document', 'sticker'].includes(m.type) && <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(m[m.type] || m.kapso?.message_type_data || { tipo: m.type }, null, 2)}</pre>}
    <footer className="text-[11px] text-muted-foreground">{Number.isNaN(date.getTime()) ? '' : date.toLocaleString('es-CL')} {m.kapso?.status ? `· ${statuses[m.kapso.status] || m.kapso.status}` : ''}</footer>
  </article>;
}