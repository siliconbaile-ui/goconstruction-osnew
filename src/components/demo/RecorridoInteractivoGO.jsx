import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function RecorridoInteractivoGO({ data }) {
  const [paso, setPaso] = useState(0);
  const { proyecto, kpis, partidas } = data;
  const real = Number(proyecto.avance_real);
  const programado = Number(proyecto.avance_programado);
  const partida = partidas.find(p => Number.isFinite(Number(p.avance_real)) && Number.isFinite(Number(p.avance_programado)));
  const pasos = [
    { titulo: 'Avance', detalle: Number.isFinite(real) && Number.isFinite(programado)
      ? `Programado ${programado}% − real ${real}% = ${(programado - real).toFixed(1)} puntos porcentuales de brecha. Una brecha no explica por sí sola la causa.`
      : 'No hay avance suficiente para calcular la brecha.', destino: 'demo-avance' },
    { titulo: 'Partida y calidad', detalle: partida
      ? `${partida.codigo || partida.nombre}: programado ${partida.avance_programado}% − real ${partida.avance_real}% = ${(Number(partida.avance_programado) - Number(partida.avance_real)).toFixed(1)} puntos. Estado de calidad: ${partida.estado_calidad || 'sin verificar'}.`
      : `${kpis.nc_abiertas} no conformidades abiertas en la obra demo. Revisa las inspecciones para encontrar la evidencia.`, destino: 'demo-calidad' },
    { titulo: 'Pagos', detalle: `${kpis.edps_bloqueados} estados de pago bloqueados por calidad; monto bloqueado: USD ${Number(kpis.monto_bloqueado_usd || 0).toLocaleString('es-CL')}. El desbloqueo requiere revisión y autorización humana.`, destino: 'demo-pagos' },
  ];
  const actual = pasos[paso];
  return <section aria-label="Recorrido interactivo por las funciones de GO" className="orion-panel p-4 sm:p-5">
    <p className="text-xs font-mono text-primary">RECORRIDO GO · OBRA DEMO · SOLO LECTURA</p>
    <h2 className="mt-2 text-lg font-semibold">Explora cómo GO conecta los datos de la obra</h2>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Elegir función">
      {pasos.map((item, index) => <button type="button" key={item.titulo} onClick={() => setPaso(index)} aria-pressed={paso === index} className={`min-h-11 rounded-lg border px-3 text-sm ${paso === index ? 'border-primary bg-primary text-primary-foreground' : 'border-hairline bg-surface-raised text-foreground'}`}>{index + 1}. {item.titulo}</button>)}
    </div>
    <p aria-live="polite" className="mt-4 min-h-14 text-sm leading-relaxed">{actual.detalle}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <a href={`#${actual.destino}`} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary underline underline-offset-4">Ver datos de origen</a>
      <div className="ml-auto flex gap-2">
        <button type="button" aria-label="Paso anterior" disabled={paso === 0} onClick={() => setPaso(paso - 1)} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-hairline disabled:opacity-40"><ArrowLeft className="h-4 w-4" /></button>
        <button type="button" aria-label="Paso siguiente" disabled={paso === pasos.length - 1} onClick={() => setPaso(paso + 1)} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-hairline disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  </section>;
}