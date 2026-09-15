import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, X } from 'lucide-react';

export default function PublicGoData({ onClose, onPrompt, busy }) {
  const { data, isPending, error, refetch, isFetching } = useQuery({ queryKey: ['public-go-demo'], queryFn: async () => (await base44.functions.invoke('demoObra', {})).data, staleTime: 60000, retry: 1 });
  const metrics = data ? [ ['Avance real', `${data.proyecto.avance_real ?? '—'}%`], ['Programado', `${data.proyecto.avance_programado ?? '—'}%`], ['NC abiertas', data.kpis.nc_abiertas], ['RDIs pendientes', data.kpis.rdis_pendientes], ['EDPs bloqueados', data.kpis.edps_bloqueados], ['Retenido · USD', Number(data.kpis.monto_bloqueado_usd).toLocaleString('es-CL')] ] : [];
  return (
    <aside id="public-go-data" aria-label="Datos de demostración" className="fixed inset-0 z-40 flex flex-col border-l border-hairline bg-surface p-5 lg:static lg:z-auto lg:w-80 lg:shrink-0">
      <header className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Obra de demostración</h2><button onClick={onClose} aria-label="Cerrar datos de demostración" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-raised"><X className="h-4 w-4" /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto space-y-4">
        {isPending && <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><Loader2 className="h-4 w-4 animate-spin" />Consultando demo…</p>}
        {error && <div role="alert" className="space-y-3 text-sm"><p>No pudimos cargar los datos demo. Puedes seguir conversando con GO.</p><button disabled={isFetching} onClick={() => refetch()} className="min-h-11 rounded-full border border-hairline px-4 disabled:opacity-40">Reintentar</button></div>}
        {data && <>
          <p className="text-[10px] font-mono tracking-wider text-primary">{data.proyecto.codigo} · SOLO LECTURA</p>
          <h3 className="text-lg font-semibold">{data.proyecto.nombre}</h3>
          <div className="grid grid-cols-2 gap-2">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-hairline bg-surface-base p-3"><p className="text-lg font-semibold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>)}</div>
          <h3 className="text-xs font-semibold">Alertas del escenario</h3>
          {data.alertas?.length ? data.alertas.slice(0, 3).map((a, index) => <button key={index} disabled={busy} onClick={() => onPrompt(`Analiza esta alerta de la demo con evidencia y acciones recomendadas: ${a.titulo}`)} className="w-full rounded-xl border border-hairline p-3 text-left disabled:opacity-40"><p className="text-[10px] uppercase text-warn">{a.nivel}</p><p className="mt-1 text-xs font-medium">{a.titulo}</p><p className="mt-1 text-xs text-muted-foreground">{a.mensaje}</p></button>) : <p className="text-xs text-muted-foreground">No hay alertas activas en la demo.</p>}
          <Link to="/demo" className="flex min-h-11 items-center justify-center rounded-full bg-surface-raised px-3 text-xs font-semibold">Ver todos los datos demo</Link>
        </>}
      </div>
      <div className="mt-4 border-t border-hairline pt-4"><p className="mb-3 text-xs leading-relaxed text-muted-foreground">Para cargar documentos y operar tu obra real, inicia sesión.</p><Link to="/login?returnTo=%2Fapp" className="flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground">Trabajar con mi obra</Link></div>
    </aside>
  );
}