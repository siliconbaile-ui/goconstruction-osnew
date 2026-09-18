import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import kapsoClient, { kapsoError } from '@/components/kapso/kapsoClient';
import KapsoWorkspace from '@/components/kapso/KapsoWorkspace';

export default function KapsoConnection() {
  const [page, setPage] = useState(1);
  const [phoneId, setPhoneId] = useState('');
  const query = useQuery({ queryKey: ['kapso-numbers', page], queryFn: () => kapsoClient({ action: 'numbers', page }), retry: false, refetchOnWindowFocus: false });
  const numbers = query.data?.data || [];
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold">Número de WhatsApp</h3><Button type="button" variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}>Actualizar conexión</Button></div>
    {query.isPending && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Conectando con Kapso…</p>}
    {query.error && <p role="alert" className="text-sm text-destructive">{kapsoError(query.error)}</p>}
    {query.data && <p className="text-xs text-ok">Cuenta conectada · {query.data.meta?.total_count ?? numbers.length} números</p>}
    {query.data && !numbers.length && <p className="text-sm text-muted-foreground">No hay números disponibles en esta página. Conecta uno en Kapso y actualiza.</p>}
    {!!numbers.length && <><label htmlFor="kapso-phone" className="block text-sm">Selecciona el número que quieres consultar</label><select id="kapso-phone" value={phoneId} onChange={e => setPhoneId(e.target.value)} className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"><option value="">Seleccionar número…</option>{numbers.map(n => <option key={n.id} value={n.id}>{n.name} · {n.number || 'Número no informado'} · {n.status}</option>)}</select></>}
    {(query.data?.meta?.total_pages > 1 || page > 1) && <div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={page === 1 || query.isFetching} onClick={() => { setPhoneId(''); setPage(p => p - 1); }}>Anterior</Button><span className="text-xs">Página {page}</span><Button variant="outline" size="sm" disabled={query.isFetching || !query.data || page >= query.data.meta.total_pages} onClick={() => { setPhoneId(''); setPage(p => p + 1); }}>Siguiente</Button></div>}
    <a href="https://app.kapso.ai" target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-primary underline">Administrar números en Kapso</a>
    {phoneId && <KapsoWorkspace key={phoneId} phoneId={phoneId} />}
  </div>;
}