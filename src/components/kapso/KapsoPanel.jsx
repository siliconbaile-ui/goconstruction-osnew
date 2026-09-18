import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import KapsoConnection from '@/components/kapso/KapsoConnection';

export default function KapsoPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  if (user?.role !== 'admin') return null;
  return <section id="kapso" className="rounded-xl border border-border bg-card p-5 space-y-5 text-card-foreground">
    <header className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-primary" /><div><h2 className="font-semibold">WhatsApp · Kapso</h2><p className="text-xs text-muted-foreground">Sandbox WhatsApp · operación manual</p></div></div><Button type="button" variant="outline" aria-expanded={open} aria-controls="kapso-content" onClick={() => setOpen(v => !v)}>{open ? 'Cerrar bandeja' : 'Abrir Kapso'}</Button></header>
    <p className="text-sm text-muted-foreground">Consulta conversaciones, fotos, audios, documentos y ubicaciones. Responde o pide la ubicación al contacto durante su ventana de atención.</p>
    <p className="rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">GO opera exclusivamente en Sandbox WhatsApp. Los dos números reales permanecen intactos. La asociación de fotos a obras y las alertas automáticas con plantillas siguen pendientes.</p>
    {open && <div id="kapso-content"><KapsoConnection /></div>}
  </section>;
}