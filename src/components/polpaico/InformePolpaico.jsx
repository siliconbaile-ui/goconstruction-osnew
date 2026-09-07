import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDown, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PolpaicoSection from '@/components/polpaico/PolpaicoSection';
const n = value => Number(value || 0).toLocaleString('es-CL');
export default function InformePolpaico({ data }) {
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [url, setUrl] = useState(''), [login, setLogin] = useState(false);
  const { proyecto: p, kpis: k, informe } = data;
  const color = informe?.estado_general === 'rojo' ? 'bg-danger' : informe?.estado_general === 'verde' ? 'bg-ok' : 'bg-warn';
  const filas = [['Avance real', `${p.avance_real}%`, 'Seguimiento'], ['Avance programado', `${p.avance_programado}%`, 'Referencia'], ['Desviación', `${k.desviacion} pts`, Math.abs(k.desviacion) > p.umbral_desviacion ? 'Atención' : 'En rango'], ['NCs abiertas', k.nc_abiertas, k.nc_abiertas ? 'Revisión' : 'Sin NC'], ['EDPs bloqueados', k.edps_bloqueados, k.edps_bloqueados ? 'Retenido' : 'Sin bloqueo'], ['USD retenidos', `USD $${n(k.monto_retenido)}`, k.monto_retenido ? 'Retenido' : 'Sin retención'], ['m³ hormigón trazados', `${n(k.volumen_trazado)} m³`, 'Registrado'], ['Árboles equivalentes', n(k.arboles), 'Estimado']];
  const exportar = async () => {
    setPending(true); setError(''); setLogin(false); setUrl('');
    try {
      if (!await base44.auth.isAuthenticated()) { setLogin(true); return; }
      const response = await base44.functions.invoke('exportarInformePDF', { proyecto_id: p.id });
      if (!response.data?.url) throw new Error('No se obtuvo el enlace del informe. Intenta nuevamente.');
      setUrl(response.data.url);
    } catch (err) { setError(err.response?.data?.error || err.message); }
    finally { setPending(false); }
  };
  return <PolpaicoSection id="informe" number="05" eyebrow="Decisiones con contexto" title="Informe Ejecutivo — Polpaico OS" subtitle="Consolidado para Gerencia de Innovación y Finanzas. Indicadores actuales del piloto y exportación del último informe guardado.">
    <div className="grid lg:grid-cols-3 gap-5"><div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center text-center"><span className={`w-16 h-16 rounded-full my-5 ${color}`} /><h3 className="font-semibold text-lg">Estado general: {(informe?.estado_general || 'sin informe').toUpperCase()}</h3><p className="text-sm text-muted-foreground leading-relaxed mt-3">Desviación {k.desviacion} pts · {k.nc_criticas} NC crítica(s) · {k.edps_bloqueados} EDP bloqueado(s)</p><p className="text-xs text-muted-foreground mt-4">Semáforo del informe: {informe?.fecha_generacion ? new Date(informe.fecha_generacion).toLocaleDateString('es-CL') : '—'}</p>
      <button onClick={exportar} disabled={pending || !informe} className="w-full min-h-11 mt-8 px-4 py-3 border border-border rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-muted transition-colors duration-200 disabled:opacity-50">{pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}Descargar informe PDF</button>
      {login && <p role="status" className="text-sm mt-3 text-warn">La exportación requiere sesión. <Link className="underline" to="/login?returnTo=%2Fpolpaico-os%23informe">Iniciar sesión</Link></p>}
      {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}{url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-ok underline min-h-11 flex items-center mt-3">Abrir PDF generado</a>}
    </div><div className="lg:col-span-2 overflow-x-auto bg-card border border-border rounded"><table className="w-full text-sm"><thead><tr><th scope="col">KPI</th><th scope="col">Valor</th><th scope="col">Semáforo</th></tr></thead><tbody>{filas.map(([label, value, estado]) => <tr key={label}><td>{label}</td><td className="font-mono font-semibold whitespace-nowrap">{value}</td><td className={['Retenido', 'Revisión'].includes(estado) ? 'text-danger' : estado === 'Atención' ? 'text-warn' : 'text-muted-foreground'}>{estado}</td></tr>)}</tbody></table></div></div>
    <p className="mt-5 p-5 rounded-lg bg-card border border-border text-sm text-muted-foreground leading-relaxed">Semana: avance real {p.avance_real}% vs {p.avance_programado}% programado (desviación {k.desviacion} puntos). {k.nc_criticas} NC crítica(s) abierta(s) retiene(n) USD ${n(k.monto_retenido)}. HormiPurifica trazado: {n(k.volumen_hormipurifica)} m³ ({n(k.arboles)} árboles equivalentes estimados). Telemetría ObraLink: {k.sensores} sensores simulados activos, {k.sensores_optimos} con resistencia objetivo alcanzada.</p>
  </PolpaicoSection>;
}