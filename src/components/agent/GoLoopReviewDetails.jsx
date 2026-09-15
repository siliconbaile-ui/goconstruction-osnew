export default function GoLoopReviewDetails({ ciclo }) {
  const informe = ciclo.informe || {};
  return <div className="space-y-3 text-xs text-muted-foreground">
    <p className="font-medium text-foreground">Revisión del informe ≠ autorización de obra</p>
    {ciclo.revision?.intentos?.map((revision, i) => <div key={i}><p className="font-medium">Revisión {i + 1}: {revision.aprobado ? 'Informe aceptado' : 'Correcciones necesarias'}</p><ul className="mt-1 list-inside list-disc">{revision.observaciones?.map((item, j) => <li key={j} className="break-words">{item}</li>)}</ul></div>)}
    {informe.criterio_verificacion && <p><strong className="text-foreground">Qué verificar: </strong>{informe.criterio_verificacion}</p>}
    {informe.pendientes?.length > 0 && <div><strong className="text-foreground">Pendientes de acción o evidencia</strong><ul className="mt-1 list-inside list-disc">{informe.pendientes.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
    {ciclo.aprendizaje_propuesto && <p><strong className="text-foreground">Aprendizaje propuesto · no validado: </strong>{ciclo.aprendizaje_propuesto}</p>}
    <details><summary className="min-h-11 cursor-pointer py-3">Consultas registradas ({ciclo.evidencias?.length || 0})</summary><ul className="space-y-2">{ciclo.evidencias?.map((ev, i) => <li key={i} className="break-words">{ev.entidad || ev.herramienta} · {new Date(ev.consultado_en).toLocaleString('es-CL')}{ev.ids?.length > 0 && <p className="font-mono text-[10px]">{ev.ids.join(', ')}</p>}{ev.pregunta && <p>{ev.pregunta}</p>}</li>)}</ul></details>
  </div>;
}