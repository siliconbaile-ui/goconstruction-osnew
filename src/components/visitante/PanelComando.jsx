import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { TrendingUp, FileText, CreditCard, Lock, CheckCircle2, AlertTriangle, MessageCircle, Loader2 } from 'lucide-react';

const AMBER = '#E8912E';

const KPI_TILES = [
  { key: 'avance', label: 'AVANCE', icon: TrendingUp, color: 'hsl(var(--primary))' },
  { key: 'rdi', label: 'RDI', icon: FileText, color: AMBER },
  { key: 'edp', label: 'EDP', icon: CreditCard, color: 'hsl(var(--danger))' },
];

const ACTIONS = [
  { key: 'bloquear', label: 'Bloquear EDP', icon: Lock, fn: 'bloquearPagoPorNC', color: 'hsl(var(--danger))' },
  { key: 'aprobar', label: 'Aprobar vaciado', icon: CheckCircle2, fn: 'verificarCierreNC', color: 'hsl(var(--ok))' },
  { key: 'escalar', label: 'Escalar RDI', icon: AlertTriangle, fn: 'escalarAlertasCriticas', color: AMBER },
];

const CONSULTAS = [
  '¿Qué recubrimiento exige la EETT en losas a la intemperie?',
  'Muéstrame las 3 partidas en rojo que bloquean el pago.',
  'Generar un reporte de las NC críticas de hoy.',
];

// Columna derecha · Contexto de datos y acciones de mando.
export default function PanelComando({ data, alConsultar }) {
  const proyecto = data?.proyecto;
  const kpis = data?.kpis;
  const [confirming, setConfirming] = useState(null);
  const [executing, setExecuting] = useState(null);
  const [result, setResult] = useState(null);

  const kpiValues = {
    avance: proyecto ? `${proyecto.avance_real ?? 0}%` : '—',
    rdi: kpis?.rdis_pendientes ?? '—',
    edp: kpis?.edps_bloqueados ?? '—',
  };

  const handleAction = async (action) => {
    if (confirming !== action.key) {
      setConfirming(action.key);
      setTimeout(() => setConfirming(null), 4000);
      return;
    }
    setConfirming(null);
    setExecuting(action.key);
    setResult(null);
    try {
      const inspId = data?.inspecciones?.find(i => i.es_no_conformidad)?.id || data?.inspecciones?.[0]?.id;
      const args = action.key === 'escalar' ? {} : { inspeccion_id: inspId };
      const res = await base44.functions.invoke(action.fn, args);
      setResult({ key: action.key, success: true, data: res });
    } catch (err) {
      const isAuth = err?.message?.includes('401') || err?.message?.includes('Unauthorized') || err?.message?.includes('Forbidden');
      setResult({ key: action.key, success: false, auth: isAuth, error: err.message });
    } finally {
      setExecuting(null);
    }
  };

  return (
    <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 border-l border-hairline bg-surface-base/50 backdrop-blur-xl h-full overflow-y-auto">
      <div className="px-5 py-4 border-b border-hairline flex-shrink-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tu obra, en vivo</div>
        <div className="text-sm font-bold text-foreground mt-0.5">{proyecto?.nombre || 'GoConstruction OS — Demo de Ventas'}</div>
        <div className="font-mono text-[10px] text-muted-foreground mt-1">{data?.partidas?.length ?? 0} partidas indexadas</div>
      </div>

      {/* KPIs */}
      <div className="px-4 py-4 border-b border-hairline flex-shrink-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">KPIs conversacionales</div>
        <div className="grid grid-cols-3 gap-2">
          {KPI_TILES.map(k => (
            <div key={k.key} className="glass-card p-2.5 text-center">
              <k.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: k.color }} />
              <div className="font-mono text-lg font-bold text-foreground">{kpiValues[k.key]}</div>
              <div className="font-mono text-[9px] uppercase text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultas sugeridas */}
      <div className="px-4 py-3 border-b border-hairline flex-shrink-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Consultas para probar</div>
        <div className="space-y-1.5">
          {CONSULTAS.map(q => (
            <button key={q} onClick={() => alConsultar?.(q)}
              className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] text-foreground/80 glass-card hover:border-primary/40 transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Action tiles */}
      <div className="px-4 py-3 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Acciones de mando</div>
        <div className="space-y-2">
          {ACTIONS.map(a => {
            const isConfirming = confirming === a.key;
            const isExecuting = executing === a.key;
            const res = result?.key === a.key ? result : null;
            return (
              <div key={a.key}>
                <button
                  onClick={() => handleAction(a)}
                  disabled={isExecuting}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass-card transition-colors disabled:opacity-50"
                  style={{ borderColor: isConfirming ? a.color : undefined }}>
                  {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <a.icon className="w-4 h-4" style={{ color: a.color }} />}
                  <span className="flex-1 text-left text-foreground">{isConfirming ? '¿Confirmar?' : a.label}</span>
                </button>
                {res && (
                  <div className={`mt-1 px-2.5 py-1.5 rounded-lg text-[11px] ${res.success ? 'bg-ok/10 text-ok' : 'bg-danger/10 text-danger'}`}>
                    {res.success ? '✓ Acción ejecutada' : res.auth ? 'Requiere inicio de sesión' : `Error: ${res.error}`}
                    {res.auth && <Link to="/login" className="ml-1 underline">Entrar</Link>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 mt-auto border-t border-hairline flex-shrink-0">
        <Link to="/demo" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-colors hover:bg-surface-raised" style={{ borderColor: AMBER, color: AMBER }}>
          <MessageCircle className="w-4 h-4" /> Ver demo por WhatsApp
        </Link>
      </div>
    </aside>
  );
}