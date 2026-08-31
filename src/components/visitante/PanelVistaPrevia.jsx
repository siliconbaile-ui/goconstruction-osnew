import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, CheckSquare, FileText, CreditCard, ArrowRight } from 'lucide-react';

// Panel derecho tipo youify.lat: vista previa en vivo de una obra demo.
// Carga datos reales del proyecto demo si existen; si no, muestra el estado vacío.
export default function PanelVistaPrevia() {
  const [proyecto, setProyecto] = useState(null);
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const proyectos = await base44.entities.ProyectoObra.filter({ es_demo: true }, '-created_date', 1);
        if (proyectos[0]) {
          setProyecto(proyectos[0]);
          const pts = await base44.entities.PartidaControl.filter({ proyecto_id: proyectos[0].id }, '-created_date', 6);
          setPartidas(pts);
        }
      } catch {
        // sin datos demo — el panel muestra estado vacío
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <aside className="hidden xl:flex flex-col w-72 flex-shrink-0 border-l border-hairline bg-surface-base h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-hairline">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Tu obra, en vivo
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {proyecto?.nombre || 'Obra Piloto'}
            </div>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-ok/10 text-ok border border-ok/20">
            <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
            EN VIVO
          </span>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground mt-1">
          {loading ? 'Cargando...' : `${partidas.length} partidas indexadas`}
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="px-4 py-3 border-b border-hairline grid grid-cols-2 gap-2">
        {[
          { label: 'AVANCE', value: `${(proyecto?.avance_real || 0).toFixed(0)}%`, icon: TrendingUp, color: 'hsl(var(--primary))' },
          { label: 'NC', value: '0', icon: CheckSquare, color: 'hsl(var(--ok))' },
          { label: 'RDIs', value: '0', icon: FileText, color: 'hsl(var(--info))' },
          { label: 'EDPs', value: '0', icon: CreditCard, color: 'hsl(var(--warn))' },
        ].map(k => (
          <div key={k.label} className="rounded-lg p-2 bg-surface-raised border border-hairline">
            <k.icon className="w-3 h-3 mb-1" style={{ color: k.color }} />
            <div className="font-mono text-[9px] uppercase text-muted-foreground">{k.label}</div>
            <div className="text-sm font-bold text-foreground">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Partidas */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Partidas en control
        </div>
        <div className="space-y-1.5">
          {loading ? (
            <div className="space-y-1.5">
              {[1,2,3].map(i => (
                <div key={i} className="h-10 rounded-lg bg-surface-raised animate-pulse" />
              ))}
            </div>
          ) : partidas.length === 0 ? (
            <div className="text-center py-6">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-20 text-primary" />
              <p className="text-[11px] text-muted-foreground">
                La obra demo se carga al activar tu piloto.
              </p>
            </div>
          ) : (
            partidas.map(p => (
              <div key={p.id} className="rounded-lg p-2 bg-surface-raised border border-hairline">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-foreground truncate">{p.nombre}</span>
                  <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0 ml-2">{p.codigo || ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-surface-0 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${p.avance_real || 0}%` }} />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">{p.avance_real || 0}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-3 border-t border-hairline">
        <Link to="/demo" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground">
          Ver demo con obra cargada <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}