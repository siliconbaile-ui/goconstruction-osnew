import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PolpaicoHero from '@/components/polpaico/PolpaicoHero';
import LogisticaPolpaico from '@/components/polpaico/LogisticaPolpaico';
import TelemetriaPolpaico from '@/components/polpaico/TelemetriaPolpaico';
import CalidadPolpaico from '@/components/polpaico/CalidadPolpaico';
import ESGPolpaico from '@/components/polpaico/ESGPolpaico';
import InformePolpaico from '@/components/polpaico/InformePolpaico';
import ComandoPolpaico from '@/components/polpaico/ComandoPolpaico';

export default function PolpaicoOS() {
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['polpaico-public-dashboard'],
    queryFn: async () => { const result = await base44.functions.invoke('dashboardPolpaico', {}); return result.data; },
    refetchInterval: 30000, staleTime: 15000, retry: 1,
  });
  useEffect(() => { const anterior = document.title; document.title = 'Polpaico OS · Piloto Icafal Colina'; return () => { document.title = anterior; }; }, []);
  return <div className="polpaico-portal bg-background text-foreground font-body min-h-screen">
    <PolpaicoHero />
    <main className="max-w-7xl mx-auto px-5 sm:px-8 pb-8">
      <div className="flex flex-wrap justify-between items-center gap-3 py-5 border-b border-border">
        <div><p className="text-xs font-mono text-muted-foreground">POLPAICO-DEMO-01 · FUENTE: REGISTROS DEL PILOTO</p><p className="text-[10px] text-muted-foreground mt-1">Actualización cada 30 s{data ? ` · Última consulta: ${new Date(data.actualizado_en).toLocaleTimeString('es-CL', { timeZone: 'America/Santiago' })}` : ''}</p></div>
        <button onClick={() => refetch()} disabled={isFetching} className="min-h-11 flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />Actualizar datos</button>
      </div>
      {isLoading && <div className="min-h-72 flex items-center justify-center gap-3 text-muted-foreground" role="status"><Loader2 className="w-5 h-5 animate-spin" />Cargando piloto Polpaico…</div>}
      {isError && <div role="alert" className="p-5 my-6 bg-warn/10 border border-warn/30 rounded-lg text-sm text-warn">No se pudo actualizar el piloto. {data ? 'Se muestran los últimos datos disponibles.' : 'Pulsa Actualizar datos para reintentar.'}</div>}
      {data && <><LogisticaPolpaico data={data} /><TelemetriaPolpaico data={data} /><CalidadPolpaico data={data} /><ESGPolpaico data={data} /><InformePolpaico data={data} /><ComandoPolpaico data={data} /></>}
    </main>
    <footer className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-wrap justify-between gap-4 text-xs text-muted-foreground"><p>Polpaico OS · powered by b2bytes Agent OS</p><div className="flex gap-5"><Link to="/privacidad">Privacidad</Link><Link to="/terminos">Términos</Link><a href="#polpaico-inicio">Volver arriba ↑</a></div></footer>
  </div>;
}