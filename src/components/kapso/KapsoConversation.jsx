import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import kapsoClient, { kapsoError } from '@/components/kapso/kapsoClient';
import KapsoMessage from '@/components/kapso/KapsoMessage';
import KapsoReplyForm from '@/components/kapso/KapsoReplyForm';

export default function KapsoConversation({ phoneId, conversation }) {
  const query = useInfiniteQuery({
    queryKey: ['kapso', phoneId, 'messages', conversation.id], initialPageParam: null,
    queryFn: ({ pageParam }) => kapsoClient({ action: 'messages', phone_id: phoneId, conversation_id: conversation.id, after: pageParam }),
    getNextPageParam: last => last.data.length ? last.after || undefined : undefined,
    retry: false, refetchOnWindowFocus: false,
  });
  const messages = [...new Map((query.data?.pages.flatMap(p => p.data) || []).map(m => [m.id, m])).values()].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  return <div className="min-w-0 space-y-4">
    <header className="flex items-center justify-between gap-3">
      <div className="min-w-0"><h4 className="font-semibold break-words">{conversation.kapso?.contact_name || 'Contacto'}</h4><p className="text-xs text-muted-foreground break-all">{conversation.phone_number || conversation.business_scoped_user_id}</p></div>
      <Button type="button" variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw className="mr-2 h-4 w-4" />Actualizar</Button>
    </header>
    {query.isPending && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Cargando mensajes…</p>}
    {query.error && <p role="alert" className="text-sm text-destructive">{kapsoError(query.error)}</p>}
    <div className="max-h-[28rem] overflow-y-auto space-y-3 pr-2" aria-label="Historial de WhatsApp">
      {query.hasNextPage && <Button type="button" variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.fetchNextPage()}>Cargar mensajes anteriores</Button>}
      {!query.isPending && !query.error && !messages.length && <p className="text-sm text-muted-foreground">No hay mensajes disponibles.</p>}
      {messages.map(m => <KapsoMessage key={m.id} message={m} />)}
    </div>
    <KapsoReplyForm phoneId={phoneId} conversationId={conversation.id} canSend={!query.error && !!query.data?.pages[0]?.can_send} />
  </div>;
}