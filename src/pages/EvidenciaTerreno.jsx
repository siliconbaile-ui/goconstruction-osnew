import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OrionCard from '@/components/OrionCard';
import CapturaEvidencia from '@/components/evidencia/CapturaEvidencia';
import EvidenciaGrid from '@/components/evidencia/EvidenciaGrid';
import GoModuleAssist from '@/components/agent/GoModuleAssist';
import goModuleInsights from '@/lib/goModuleInsights';
import applyGoRecordEvent from '@/lib/applyGoRecordEvent';

export default function EvidenciaTerreno() {
  const [proyecto, setProyecto] = useState(null);
  const [partidas, setPartidas] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    (async () => {
      const [pvs, pts, insp] = await Promise.all([
        base44.entities.ProyectoObra.list('-created_date', 5),
        base44.entities.PartidaControl.list('-created_date', 100),
        base44.entities.InspeccionCalidad.filter({ tipo: 'foto' }, '-created_date', 60),
      ]);
      setProyecto(pvs[0] || null);
      setPartidas(pts);
      setInspecciones(insp);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = base44.entities.InspeccionCalidad.subscribe(event => {
      if (event.type === 'delete' || event.data?.tipo === 'foto') setInspecciones(prev => applyGoRecordEvent(prev, event));
    });
    return unsubscribe;
  }, []);

  const filtradas = inspecciones.filter(i => {
    if (filtro === 'nc') return i.es_no_conformidad;
    if (filtro === 'sin_gps') return !i.coordenadas_gps;
    return true;
  });

  const insights = goModuleInsights('Terreno', inspecciones);
  const stats = [
    { label: 'EVIDENCIAS', value: inspecciones.length, color: 'hsl(var(--muted-foreground))' },
    { label: 'NO CONFORMIDADES', value: inspecciones.filter(i => i.es_no_conformidad).length, color: 'hsl(var(--danger))' },
    { label: 'GEORREFERENCIADAS', value: inspecciones.filter(i => i.coordenadas_gps).length, color: 'hsl(var(--ok))' },
    { label: 'SIN GPS', value: inspecciones.filter(i => !i.coordenadas_gps).length, color: 'hsl(var(--warn))' },
  ];

  return (
    <div className="go-module-page p-4 lg:p-6 space-y-5">
      <div>
        <div className="font-mono text-xs mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>MÓDULO 4 · EVIDENCIA VISUAL</div>
        <h1 className="text-xl font-bold text-white">Bitácora Visual Georreferenciada</h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Una foto, un GPS, una inspección técnica automática. Ningún hormigón se vacía sobre enfierradura sin verificar.
        </p>
      </div>

      <GoModuleAssist area="Terreno" priorities={insights.priorities} snapshot={insights.snapshot} loading={loading} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <OrionCard key={s.label} className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </OrionCard>
        ))}
      </div>

      {!loading && !proyecto ? (
        <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">
          CONFIGURA UNA OBRA PARA REGISTRAR EVIDENCIA
        </OrionCard>
      ) : (
        <CapturaEvidencia
          proyecto={proyecto}
          partidas={partidas}
          onRegistrada={insp => setInspecciones(prev => [insp, ...prev.filter(i => i.id !== insp.id)])}
        />
      )}

      <div className="go-module-filters flex gap-2">
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'nc', label: 'No conformidades' },
          { key: 'sin_gps', label: 'Sin GPS' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded text-xs font-mono ${filtro === f.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={filtro === f.key ? { background: 'hsl(var(--primary))' } : { background: 'hsl(var(--surface-0))', border: '1px solid hsl(var(--surface-2))' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <OrionCard className="p-8 text-center text-slate-500 font-mono text-xs">CARGANDO EVIDENCIA...</OrionCard>
      ) : (
        <EvidenciaGrid inspecciones={filtradas} partidas={partidas} />
      )}
    </div>
  );
}