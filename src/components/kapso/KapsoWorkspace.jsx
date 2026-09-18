import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import kapsoClient, { kapsoError } from '@/components/kapso/kapsoClient';
import KapsoConversation from '@/components/kapso/KapsoConversation';

export default function KapsoWorkspace({ phoneId }) {
  const [active, setActive] = useState(null);
  const query = useInfiniteQuery({
    queryKey: ['kapso', phoneId, 'conversations'], initialPageParam: null,
    queryFn: ({ pageParam }) => kapsoClient({ action: 'conversations', phone_id: phoneId, after: pageParam }),
    getNextPageParam: last => last.data.length ? last.after || undefined : undefined,
    retry: false, refetchOnWindowFocus: false,
  });
  const conversations = [...new Map((query.data?.pages.flatMap(p => p.data) || []).map(c => [c.id, c])).values()];
  return <div className="grid gap-5 lg:grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)] border-t pt-5">
    <div className="space-y-3 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Conversaciones</h3><Button type="button" variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}>Actualizar</Button></div>
      {query.isPending && <p role="status" className="flex gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Cargando…</p>}
      {query.error && <p role="alert" className="text-sm text-destructive">{kapsoError(query.error)}</p>}
      {!query.isPending && !query.error && !conversations.length && <p className="text-sm text-muted-foreground">Aún no hay conversaciones en este número. Envía un WhatsApp desde tu teléfono y actualiza.</p>}
      <div className="max-h-96 overflow-y-auto space-y-2">{conversations.map(c => <button key={c.id} type="button" aria-pressed={active?.id === c.id} onClick={() => setActive(c)} className={`w-full rounded-lg border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring ${active?.id === c.id ? 'border-primary bg-primary/10' : 'border-border bg-surface-raised'}`}><span className="block truncate text-sm font-medium">{c.kapso?.contact_name || c.phone_number || c.business_scoped_user_id || 'Contacto'}</span><span className="block truncate text-xs text-muted-foreground">{c.kapso?.last_message_text || c.kapso?.last_message_type || 'Abrir conversación'}</span></button>)}</div>
      {query.hasNextPage && <Button type="button" variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.fetchNextPage()}>Ver más conversaciones</Button>}
    </div>
    {active ? <KapsoConversation key={active.id} phoneId={phoneId} conversation={active} /> : <p className="text-sm text-muted-foreground py-8">Selecciona una conversación para ver textos, archivos y ubicaciones compartidas.</p>}
  </div>;
}