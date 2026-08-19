import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, FileBarChart } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import InformeCard from '@/components/informes/InformeCard';

export default function InformeEjecutivo() {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    (async () => {
      const [pvs, ins] = await Promise.all([
        base44.entities.ProyectoObra.list('-created_date', 20),
        base44.entities.InformeEjecutivo.list('-created_date', 30),
      ]);
      setProyectos(pvs);
      if (pvs[0]) setProyectoId(pvs[0].id);
      setInformes(ins);
      setLoading(false);
    })();
  }, []);

  const generar = async () => {
    const proyecto = proyectos.find(p => p.id === proyectoId);
    if (!proyecto) return;
    setGenerando(true);
    try {
      const [partidas, inspecciones, rdis, edps, alertas] = await Promise.all([
        base44.entities.PartidaControl.filter({ proyecto_id: proyecto.id }, '-updated_date', 300),
        base44.entities.InspeccionCalidad.filter({ proyecto_id: proyecto.id }, '-created_date', 300),
        base44.entities.RequerimientoInformacion.filter({ proyecto_id: proyecto.id }, '-created_date', 300),
        base44.entities.EstadoPago.filter({ proyecto_id: proyecto.id }, '-created_date', 300),
        base44.entities.AlertaSistema.filter({ proyecto_id: proyecto.id, estado: 'activa' }, '-created_date', 300),
      ]);

      const n = partidas.length || 1;
      const avanceReal = partidas.reduce((s, p) => s + (p.avance_real || 0), 0) / n;
      const avanceProg = partidas.reduce((s, p) => s + (p.avance_programado || 0), 0) / n;
      const desviacion = avanceProg > 0 ? ((avanceProg - avanceReal) / avanceProg) * 100 : 0;
      const ncAbiertas = inspecciones.filter(i => i.es_no_conformidad && ['abierta', 'en_revision', 'rechazada'].includes(i.estado)).length;
      const rdisAbiertos = rdis.filter(r => ['abierto', 'en_revision', 'vencido'].includes(r.estado)).length;
      const rdisVencidos = rdis.filter(r => r.estado === 'vencido').length;
      const edpsBloq = edps.filter(e => e.estado === 'bloqueado_calidad');
      const montoBloqueado = edpsBloq.reduce((s, e) => s + (e.monto_usd || 0), 0);
      const criticas = alertas.filter(a => a.nivel === 'critica').length;
      const partidasRojas = partidas.filter(p => {
        const d = p.avance_programado ? ((p.avance_programado - p.avance_real) / p.avance_programado) * 100 : 0;
        return d > (proyecto.umbral_desviacion || 5);
      });

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres el director de operaciones de una constructora chilena. Redacta un informe ejecutivo semanal para la alta dirección sobre la obra "${proyecto.nombre}". Español neutro, tono profesional y directo, sin relleno.

DATOS DUROS:
- Partidas totales: ${partidas.length}
- Avance real promedio: ${avanceReal.toFixed(1)}% · Programado: ${avanceProg.toFixed(1)}% · Desviación: ${desviacion.toFixed(1)}%
- Umbral de desviación tolerado: ${proyecto.umbral_desviacion || 5}%
- Partidas fuera de umbral (${partidasRojas.length}): ${partidasRojas.slice(0, 10).map(p => `${p.nombre} (real ${p.avance_real || 0}% vs prog ${p.avance_programado || 0}%)`).join('; ') || 'ninguna'}
- No conformidades abiertas: ${ncAbiertas} de ${inspecciones.length} inspecciones
- RDIs abiertos: ${rdisAbiertos} (vencidos: ${rdisVencidos})
- EDPs bloqueados por calidad: ${edpsBloq.length} · Monto retenido: USD ${montoBloqueado.toLocaleString('en-US')}
- Alertas activas: ${alertas.length} (críticas: ${criticas})
- Presupuesto total: USD ${(proyecto.presupuesto_total_usd || 0).toLocaleString('en-US')}

Entrega:
1. resumen_ejecutivo: 4 a 6 frases con la situación real de la obra, citando cifras concretas.
2. riesgos_principales: 3 a 4 riesgos priorizados, uno por línea con guion.
3. acciones_recomendadas: 3 a 5 acciones concretas con responsable sugerido, una por línea con guion.
4. estado_general: "verde" si desviación <=${proyecto.umbral_desviacion || 5}% y sin NC ni EDP bloqueados; "rojo" si hay alertas críticas, EDPs bloqueados o desviación mayor al doble del umbral; "amarillo" en el resto.`,
        response_json_schema: {
          type: 'object',
          properties: {
            resumen_ejecutivo: { type: 'string' },
            riesgos_principales: { type: 'string' },
            acciones_recomendadas: { type: 'string' },
            estado_general: { type: 'string', enum: ['verde', 'amarillo', 'rojo'] },
          },
        },
      });

      const nuevo = await base44.entities.InformeEjecutivo.create({
        proyecto_id: proyecto.id,
        periodo: `Semana al ${new Date().toLocaleDateString('es-CL')} · ${proyecto.nombre}`,
        fecha_generacion: new Date().toISOString(),
        resumen_ejecutivo: res.resumen_ejecutivo,
        riesgos_principales: res.riesgos_principales,
        acciones_recomendadas: res.acciones_recomendadas,
        estado_general: res.estado_general || 'amarillo',
        avance_real: avanceReal,
        avance_programado: avanceProg,
        desviacion,
        nc_abiertas: ncAbiertas,
        rdis_abiertos: rdisAbiertos,
        edps_bloqueados: edpsBloq.length,
        monto_bloqueado_usd: montoBloqueado,
        alertas_criticas: criticas,
        generado_por: 'Orion IA',
      });
      setInformes(prev => [nuevo, ...prev]);
    } finally {
      setGenerando(false);
    }
  };

  const eliminar = async (informe) => {
    await base44.entities.InformeEjecutivo.delete(informe.id);
    setInformes(prev => prev.filter(i => i.id !== informe.id));
  };

  const visibles = informes.filter(i => !proyectoId || i.proyecto_id === proyectoId);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#4A6FA5' }}>MÓDULO P1 · ALTA DIRECCIÓN</div>
          <h1 className="text-xl font-bold text-white">Informe Ejecutivo — Síntesis Inteligente</h1>
        </div>
        <div className="flex items-center gap-2">
          {proyectos.length > 1 && (
            <select value={proyectoId} onChange={e => setProyectoId(e.target.value)}
              className="px-3 py-2 rounded text-sm text-white font-mono"
              style={{ background: '#0A1628', border: '1px solid #1E2D4A' }}>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          )}
          <button onClick={generar} disabled={generando || !proyectoId}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white disabled:opacity-50"
            style={{ background: '#003399' }}>
            {generando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generando ? 'Analizando obra...' : 'Generar informe'}
          </button>
        </div>
      </div>

      {loading ? (
        <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO INFORMES...</OrionCard>
      ) : proyectos.length === 0 ? (
        <OrionCard className="p-8 text-center">
          <FileBarChart className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
          <p className="text-slate-500 font-mono text-xs">CONFIGURA UN PROYECTO PARA GENERAR INFORMES</p>
        </OrionCard>
      ) : visibles.length === 0 ? (
        <OrionCard className="p-8 text-center">
          <FileBarChart className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-400" />
          <p className="text-slate-500 font-mono text-xs mb-1">SIN INFORMES GENERADOS</p>
          <p className="text-xs" style={{ color: '#4A6FA5' }}>Orion consolidará avance, calidad, RDIs, pagos y alertas en un informe listo para directorio.</p>
        </OrionCard>
      ) : (
        <div className="space-y-4">
          {visibles.map(i => <InformeCard key={i.id} informe={i} onEliminar={eliminar} />)}
        </div>
      )}
    </div>
  );
}