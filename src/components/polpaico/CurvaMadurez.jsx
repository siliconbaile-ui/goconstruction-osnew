import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea, ReferenceDot } from 'recharts';
const fecha = value => new Date(value).toLocaleString('es-CL', { timeZone: 'America/Santiago', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
export default function CurvaMadurez({ lecturas, partida }) {
  if (!lecturas.length) return <p className="py-20 text-center text-muted-foreground">Este sensor aún no tiene lecturas.</p>;
  const datos = lecturas.map(l => ({ ...l, time: Date.parse(l.timestamp_lectura) }));
  const objetivo = partida.mpa_especificado || 0;
  const max = Math.ceil(Math.max(objetivo * 1.25, ...datos.map(d => d.mpa_lectura * 1.15), 1));
  const hit = objetivo > 0 ? datos.find(l => l.mpa_lectura >= objetivo) : null;
  return <div>
    <div className="h-72 w-full min-w-0" role="img" aria-label={`Curva de resistencia del sensor ${partida.sensor_id}; objetivo ${objetivo} MPa. Datos detallados en la tabla inferior.`}>
      <ResponsiveContainer width="100%" height="100%"><AreaChart data={datos} margin={{ top: 25, right: 20, bottom: 5, left: 0 }}>
        <defs><linearGradient id="polpaico-curva" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--ok))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--ok))" stopOpacity={0.01} /></linearGradient></defs>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={fecha} minTickGap={50} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, max]} unit=" MPa" width={64} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
        <Tooltip labelFormatter={fecha} formatter={value => [`${value} MPa`, 'Resistencia']} contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: 8 }} />
        {objetivo > 0 && <ReferenceArea y1={objetivo} y2={max} fill="hsl(var(--ok))" fillOpacity={0.07} />}
        {objetivo > 0 && <ReferenceLine y={objetivo} stroke="hsl(var(--warn))" strokeDasharray="6 4" label={{ value: `f'c ${objetivo} MPa`, position: 'insideTopLeft', fill: 'hsl(var(--warn))', fontSize: 11 }} />}
        <Area type="monotone" dataKey="mpa_lectura" stroke="hsl(var(--ok))" strokeWidth={2.5} fill="url(#polpaico-curva)" isAnimationActive={false} />
        {hit && <ReferenceDot x={hit.time} y={hit.mpa_lectura} r={5} fill="hsl(var(--warn))" stroke="hsl(var(--background))" />}
      </AreaChart></ResponsiveContainer>
    </div>
    {hit && <p className="text-sm text-ok mt-3">Objetivo alcanzado: {hit.mpa_lectura} MPa · {fecha(hit.time)} · pendiente de evaluación técnica.</p>}
    <details className="mt-4 text-xs"><summary className="cursor-pointer min-h-11 flex items-center text-muted-foreground">Ver lecturas y temperaturas ({datos.length})</summary><div className="overflow-x-auto"><table className="w-full"><thead><tr>{['Hora Chile', 'MPa', 'Temp. °C', "% f’c", 'Estado', 'Fuente'].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{datos.map(d => <tr key={d.id}><td className="whitespace-nowrap">{fecha(d.time)}</td><td>{d.mpa_lectura}</td><td>{d.temperatura_c ?? '—'}</td><td>{objetivo > 0 ? `${(d.mpa_lectura / objetivo * 100).toFixed(1)}%` : '—'}</td><td className={objetivo > 0 && d.mpa_lectura >= objetivo ? 'text-ok' : 'text-warn'}>{objetivo > 0 && d.mpa_lectura >= objetivo ? 'Alcanzado' : 'En curado'}</td><td>{d.fuente}</td></tr>)}</tbody></table></div></details>
  </div>;
}