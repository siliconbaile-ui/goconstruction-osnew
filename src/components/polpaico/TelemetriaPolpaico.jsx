import { useState } from 'react';
import { Radio, Zap, ShieldAlert } from 'lucide-react';
import PolpaicoSection from '@/components/polpaico/PolpaicoSection';
import CurvaMadurez from '@/components/polpaico/CurvaMadurez';
export default function TelemetriaPolpaico({ data }) {
  const [selected, setSelected] = useState('');
  const sensores = data.partidas.filter(p => p.sensor_id);
  const partida = sensores.find(p => p.id === selected) || sensores[0];
  const lecturas = partida ? data.telemetria.filter(t => t.partida_id === partida.id && t.sensor_id === partida.sensor_id) : [];
  const alerta = partida && data.alertas.find(a => a.tipo === 'resistencia_alcanzada' && a.partida_id === partida.id && ['activa', 'reconocida'].includes(a.estado));
  const ncAbierta = partida && data.ncs.some(n => n.partida_id === partida.id && !['cerrada', 'aprobada'].includes(n.estado));
  return <PolpaicoSection id="telemetria" number="02" eyebrow="Inteligencia de material" title="Telemetría de Resistencia — ObraLink RSense2" subtitle="Curva de madurez del hormigón. Alcanzar f’c es un indicador para revisión, no una autorización de desencofrado.">
    {!partida ? <p className="text-muted-foreground">Aún no hay sensores asociados a las partidas.</p> : <>
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"><div><p className="text-xs text-ok uppercase tracking-widest mb-2">Historial de resistencia · simulación</p><h3 className="font-semibold">{partida.sensor_id}</h3></div><label className="text-xs text-muted-foreground sm:max-w-sm" htmlFor="polpaico-sensor">Partida con sensor<select id="polpaico-sensor" value={partida.id} onChange={e => setSelected(e.target.value)} className="block w-full mt-2 p-3 border border-input bg-background text-foreground rounded text-sm">{sensores.map(p => <option value={p.id} key={p.id}>{p.codigo} · {p.sensor_id}</option>)}</select></label></div>
        <CurvaMadurez lecturas={lecturas} partida={partida} />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-5">{sensores.map(p => {
        const porcentaje = p.mpa_especificado > 0 ? p.mpa_lectura_actual / p.mpa_especificado * 100 : 0;
        const alcanzado = porcentaje >= 100;
        return <button key={p.id} onClick={() => setSelected(p.id)} aria-pressed={p.id === partida.id} className={`text-left p-5 rounded-lg bg-card border transition-colors duration-200 hover:bg-muted/50 ${p.id === partida.id ? 'border-ok' : 'border-border'}`}>
          <div className="flex justify-between gap-2 mb-3"><Radio className={alcanzado ? 'w-4 h-4 text-ok' : 'w-4 h-4 text-warn'} /><span className="font-mono text-xs text-muted-foreground">{p.sensor_id}</span></div><h4 className="text-sm font-semibold min-h-10">{p.nombre}</h4><p className="text-2xl font-semibold mt-5 tabular-nums">{p.mpa_lectura_actual}<span className="text-sm text-muted-foreground font-normal"> / {p.mpa_especificado} MPa</span></p>
          <div role="progressbar" aria-label={`Resistencia ${p.sensor_id}`} aria-valuenow={Math.min(100, porcentaje)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${porcentaje.toFixed(1)}% de f’c`} className="h-1.5 bg-muted rounded-full overflow-hidden my-4"><div className={alcanzado ? 'h-full bg-ok' : 'h-full bg-warn'} style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }} /></div><p className={`text-xs ${alcanzado ? 'text-ok' : 'text-warn'}`}>{alcanzado ? 'Resistencia objetivo alcanzada' : 'En curado'} · {porcentaje.toFixed(1)}%</p>
        </button>;
      })}</div>
      {alerta && <div className="mt-5 border border-warn/40 rounded-lg p-5 bg-warn/5 flex items-start gap-4"><Zap className="w-5 h-5 text-warn shrink-0 mt-1" /><div><h3 className="font-semibold">Resistencia óptima alcanzada · revisión HITL pendiente</h3><p className="text-sm mt-2">Sensor {partida.sensor_id} reporta {partida.mpa_lectura_actual} MPa; objetivo {partida.mpa_especificado} MPa.</p><p className="text-xs text-muted-foreground mt-2">Escenario del piloto: reducción potencial del ciclo de 7 a 1 día, pendiente de validación técnica.</p>{ncAbierta && <p className="flex items-start gap-2 text-sm text-warn mt-4"><ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />Existe una NC abierta: la calidad y el pago continúan bloqueados aunque se alcance la resistencia.</p>}<p className="text-xs text-muted-foreground mt-3">Solicita la revisión a GO por chat. Un administrador puede registrar una decisión del piloto, sin autorizar trabajos reales ni liberar pagos.</p></div></div>}
    </>}
  </PolpaicoSection>;
}