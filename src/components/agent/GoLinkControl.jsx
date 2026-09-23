import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { GO_WHATSAPP_NUMBER } from '@/components/whatsapp/goWhatsApp';

export default function GoLinkControl({ status, onRefresh }) {
  const [code, setCode] = useState('');
  const [expiry, setExpiry] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const act = async accion => {
    setBusy(true); setError('');
    try {
      const { data } = await base44.functions.invoke('memoriaGo', { accion });
      setCode(data.codigo || ''); setExpiry(data.expira_en || '');
      await onRefresh();
    } catch { setError('No se pudo actualizar el vínculo. Inténtalo nuevamente.'); }
    finally { setBusy(false); }
  };
  const url = code ? `https://wa.me/${GO_WHATSAPP_NUMBER}?text=${encodeURIComponent(`VINCULAR GO ${code}`)}` : '';
  return <section className="rounded-xl border border-hairline bg-surface p-4 space-y-3">
    <h3 className="text-sm font-semibold text-foreground">Vinculación de WhatsApp</h3>
    {status.vinculado ? <>
      <p className="text-xs text-muted-foreground">Conectado al número terminado en {status.telefono}. Solo tú puedes consultar el historial desde tu cuenta; WhatsApp no obtiene acceso a datos privados de la obra.</p>
      <button disabled={busy} onClick={() => act('revocar')} className="text-xs text-danger underline disabled:opacity-50">Desvincular WhatsApp</button>
    </> : <>
      <p className="text-xs text-muted-foreground">Genera un código temporal desde tu sesión y envíalo desde el WhatsApp que quieres vincular. Al vincular, podrás ver aquí las conversaciones de ese número, incluso las anteriores. No compartas el código.</p>
      <button disabled={busy} onClick={() => act('emitir')} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busy ? 'Preparando…' : 'Generar código'}</button>
      {code && <div className="space-y-2"><p className="font-mono text-base tracking-widest text-foreground">{code}</p><p className="text-xs text-muted-foreground">Vence a las {new Date(expiry).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}. Se usa una sola vez.</p><a href={url} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-ok px-3 py-2 text-xs font-semibold text-primary-foreground">Enviar código por WhatsApp</a><button onClick={onRefresh} className="ml-3 text-xs text-primary underline">Ya lo envié · actualizar</button></div>}
    </>}
    {error && <p role="alert" className="text-xs text-danger">{error}</p>}
  </section>;
}