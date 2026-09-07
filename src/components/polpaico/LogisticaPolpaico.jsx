import { Mic, Truck } from 'lucide-react';
import PolpaicoSection from '@/components/polpaico/PolpaicoSection';
import PolpaicoMetrics from '@/components/polpaico/PolpaicoMetrics';
import PolpaicoStatus from '@/components/polpaico/PolpaicoStatus';
const fecha = value => new Date(value).toLocaleString('es-CL', { timeZone: 'America/Santiago', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export default function LogisticaPolpaico({ data }) {
  const { despachos, kpis: k } = data;
  const ultimoAudio = despachos.find(d => d.audio_transcripcion?.trim());
  return <PolpaicoSection id="logistica" number="01" eyebrow="Del audio al dato" title="Logística Conversacional — Audio to Data" subtitle="Choferes reportan por WhatsApp. GO estructura el dato automáticamente. En este piloto, los reportes están precargados.">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4"><Truck className="w-4 h-4" /> Jornada actual · {data.fecha_hoy_chile} · Hora de Chile</div>
    <PolpaicoMetrics items={[{ label: 'Despachos hoy', value: k.despachos_hoy }, { label: 'En ruta', value: k.en_ruta, tone: 'text-info' }, { label: 'Descargados', value: k.descargados, tone: 'text-ok' }, { label: 'm³ transportados', value: k.volumen_transportado, detail: 'Volumen programado del día, sin cancelados' }]} />
    <div className="border border-border rounded overflow-x-auto bg-card"><table className="w-full text-sm"><caption className="sr-only">Historial completo de despachos del piloto</caption><thead><tr>{['Guía', 'Chofer', 'Origen', 'Destino', 'm³', 'Tipo', 'Estado', 'Hora carga'].map(c => <th key={c} scope="col">{c}</th>)}</tr></thead><tbody>
      {despachos.map(d => <tr key={d.id} className="hover:bg-muted/40 transition-colors duration-200"><td className="font-mono whitespace-nowrap">{d.guia_despacho}<span className="block text-[10px] text-muted-foreground mt-1">{d.patente_mixer}</span></td><td className="whitespace-nowrap">{d.chofer_nombre}</td><td className="min-w-36 text-muted-foreground">{d.origen_planta}</td><td className="min-w-44">{d.destino_obra}</td><td className="font-mono">{d.volumen_m3}</td><td><PolpaicoStatus value={d.tipo_hormigon} /></td><td><PolpaicoStatus value={d.estado} /></td><td className="text-xs whitespace-nowrap text-muted-foreground">{fecha(d.fecha_hora_carga)}</td></tr>)}
      {!despachos.length && <tr><td colSpan={8} className="text-muted-foreground">No hay despachos registrados.</td></tr>}
    </tbody></table></div>
    {ultimoAudio && <aside className="bg-secondary/25 border border-primary rounded-lg p-5 sm:p-6 mt-5 flex gap-4"><span className="rounded-lg bg-primary/30 p-3 h-fit"><Mic className="w-5 h-5 text-ok" /></span><div><p className="text-[10px] uppercase tracking-widest text-ok mb-2">Último audio transcrito · muestra precargada</p><blockquote className="text-base leading-relaxed">“{ultimoAudio.audio_transcripcion}”</blockquote><p className="text-xs text-muted-foreground mt-3">{ultimoAudio.chofer_nombre} · {fecha(ultimoAudio.fecha_hora_carga)}</p><p className="text-xs text-muted-foreground mt-2">Ejemplo de transcripción y estructura desde WhatsApp; no hay recepción de audio activa.</p></div></aside>}
  </PolpaicoSection>;
}