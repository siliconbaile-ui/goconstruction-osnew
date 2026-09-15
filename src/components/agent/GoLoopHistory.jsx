import { RefreshCw } from 'lucide-react';
import InformeSubagente from '@/components/agent/InformeSubagente';
import GoLoopReviewDetails from '@/components/agent/GoLoopReviewDetails';
const estados = { revision_completada: 'Informe revisado · acciones pendientes de verificar', requiere_revision_humana: 'Requiere revisión humana', fallido: 'Ciclo no completado' };
export default function GoLoopHistory({ ciclos, busy, onVerify, onDiscuss, disabled, limit, onLoadMore }) {
  if (ciclos.isLoading) return <p role="status" className="text-xs text-muted-foreground">Cargando seguimiento…</p>;
  if (ciclos.error) return <p role="alert" className="text-xs text-danger">No se pudo cargar el historial.</p>;
  if (!ciclos.data?.length) return <p className="text-xs text-muted-foreground">Aún no tienes ciclos guardados para esta obra.</p>;
  return <div className="space-y-2">{ciclos.data.map(ciclo => <details key={ciclo.id} className="rounded-lg border border-hairline bg-surface p-3">
    <summary className="min-h-11 cursor-pointer text-xs"><span className="block break-words font-semibold">{ciclo.informe?.titulo || ciclo.tarea}</span><span className="mt-1 block text-[10px] text-muted-foreground">{ciclo.es_demo ? 'DEMO · ' : ''}{new Date(ciclo.created_date).toLocaleString('es-CL')} · {estados[ciclo.estado]}</span></summary>
    <div className="mt-3 space-y-3">{ciclo.anterior_id && <p className="break-all text-[10px] text-muted-foreground">Verificación del ciclo {ciclo.anterior_id}</p>}{ciclo.error && <p role="alert" className="text-xs text-warn">{ciclo.error}</p>}{ciclo.informe?.titulo && <InformeSubagente informe={ciclo.informe} subagente={ciclo.especialidad} />}
      <GoLoopReviewDetails ciclo={ciclo} />
      <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => onVerify(ciclo.id)} className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 text-xs text-primary-foreground disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" />Verificar con datos actuales</button><button type="button" disabled={busy || disabled} onClick={() => onDiscuss(`Consulta con subagenteGO modo='consultar', ciclo_id='${ciclo.id}'. Revisa sus pendientes y coordina los especialistas necesarios de la obra ${ciclo.proyecto_id}. Propón el próximo paso; no apruebes decisiones críticas.`)} className="min-h-11 rounded-lg bg-surface-raised px-3 text-xs disabled:opacity-50">Coordinar con GO</button></div>
    </div>
  </details>)}{ciclos.data.length >= limit && <button type="button" onClick={onLoadMore} className="min-h-11 px-3 text-xs text-primary">Ver ciclos anteriores</button>}</div>;
}