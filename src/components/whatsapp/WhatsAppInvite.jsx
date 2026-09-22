import { useId, useRef, useState } from 'react';
import { Share2, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GO_INVITE_URL, GO_WHATSAPP_DISPLAY } from '@/components/whatsapp/goWhatsApp';

export default function WhatsAppInvite({ compact = false }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const id = useId();
  const copy = async () => {
    try { await navigator.clipboard.writeText(GO_INVITE_URL); setStatus('Enlace copiado. Envíalo a la persona que quieras invitar.'); }
    catch { input.current?.focus(); input.current?.select(); setStatus('Seleccionamos el enlace para que puedas copiarlo manualmente.'); }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    setBusy(true);
    try { await navigator.share({ title: 'Conversa con GO', text: 'Te invito a conversar con GO, el jefe técnico digital de GoConstruction OS. Sin registro para comenzar.', url: GO_INVITE_URL }); }
    catch (error) { if (error.name !== 'AbortError') setStatus('No se pudo compartir. Puedes copiar el enlace.'); }
    finally { setBusy(false); }
  };
  return <Dialog onOpenChange={() => setStatus('')}>
    <DialogTrigger asChild><button type="button" aria-label="Invitar a conversar con GO" title="Invitar a conversar con GO" className={compact ? 'flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface-raised text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-ring' : 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-hairline px-4 text-sm text-foreground hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-ring'}><Share2 className="h-4 w-4 shrink-0" />{!compact && 'Invitar a conversar con GO'}</button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl bg-surface">
      <DialogTitle>Invita a alguien de tu equipo</DialogTitle>
      <DialogDescription>Comparte este enlace neutro para conversar con GO en {GO_WHATSAPP_DISPLAY}, sin crear una cuenta. Cada persona indica su obra y necesidad dentro del chat.</DialogDescription>
      <label htmlFor={id} className="text-sm font-medium">Enlace de invitación</label>
      <input ref={input} id={id} readOnly value={GO_INVITE_URL} onFocus={event => event.target.select()} className="min-h-12 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={share} disabled={busy} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Share2 className="h-4 w-4" />{busy ? 'Compartiendo…' : 'Compartir invitación'}</button>
        <button type="button" onClick={copy} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-surface-raised px-4 text-sm"><Copy className="h-4 w-4" />Copiar</button>
      </div>
      <p role="status" className="text-sm text-muted-foreground">{status}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">No incluye datos de la obra, información personal ni tokens. Invitar a conversar no concede acceso a registros ni permisos.</p>
    </DialogContent>
  </Dialog>;
}