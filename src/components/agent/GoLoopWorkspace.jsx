import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, Network } from 'lucide-react';
import useGoLoop from '@/components/agent/useGoLoop';
import GoLoopHistory from '@/components/agent/GoLoopHistory';
const areas = [
  ['Operación de obra', [['calidad', 'Calidad y terreno'], ['programacion', 'Programación y avance']]],
  ['Control y gestión', [['control', 'RDI y alertas'], ['costos', 'Costos y pagos']]],
  ['Conocimiento e informes', [['conocimiento', 'Conocimiento técnico'], ['normativa', 'Normativa legal'], ['informes', 'Informes ejecutivos'], ['general', 'Auditoría integral']]],
];
export default function GoLoopWorkspace({ onPrompt, disabled }) {
  const { search } = useLocation(), loop = useGoLoop();
  const [especialidad, setEspecialidad] = useState('general'), [tarea, setTarea] = useState('');
  const [open, setOpen] = useState(Boolean(new URLSearchParams(search).get('go_area')));
  useEffect(() => { const area = new URLSearchParams(search).get('go_area'); if (areas.some(([, items]) => items.some(([id]) => id === area))) { setEspecialidad(area); setOpen(true); } }, [search]);
  return <details open={open} onToggle={event => setOpen(event.currentTarget.open)} className="go-control-workers mx-auto mb-4 max-w-5xl rounded-xl border border-hairline bg-surface p-3">
    <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-semibold"><Network className="h-4 w-4 text-primary" />Trabajadores IA · iniciar y seguir un ciclo</summary>
    {open && <div className="mt-3 space-y-4">
      <form onSubmit={event => { event.preventDefault(); loop.run({ tarea, especialidad }); }} className="space-y-3">
        <label className="block text-xs">Obra<select required value={loop.proyectoId} disabled={loop.busy} onChange={e => loop.setProyectoId(e.target.value)} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm"><option value="">Selecciona una obra</option>{loop.proyectos.data?.map(p => <option key={p.id} value={p.id}>{p.nombre}{p.es_demo ? ' · DEMO' : ''}</option>)}</select></label>
        {loop.proyectos.isLoading && <p role="status" className="text-xs text-muted-foreground">Cargando obras…</p>}
        {loop.proyectos.error && <p role="alert" className="text-xs text-danger">No se pudieron cargar las obras.</p>}
        {loop.proyectos.data?.length === 0 && <p className="text-xs text-muted-foreground">Crea una obra en Configuración para iniciar un ciclo.</p>}
        <label className="block text-xs">Especialista<select value={especialidad} disabled={loop.busy} onChange={e => setEspecialidad(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">{areas.map(([title, items]) => <optgroup label={title} key={title}>{items.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</optgroup>)}</select></label>
        <label className="block text-xs">Misión<textarea required maxLength={4000} value={tarea} disabled={loop.busy} onChange={e => setTarea(e.target.value)} placeholder="Qué necesitas investigar y qué resultado quieres verificar" rows={2} className="mt-1 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm" /></label>
        <button disabled={loop.busy || !loop.proyectoId || !tarea.trim()} className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50">{loop.busy && <Loader2 className="h-4 w-4 animate-spin" />}{loop.busy ? 'Especialista y revisor trabajando…' : 'Iniciar ciclo'}</button>
        <p className="text-[10px] leading-relaxed text-muted-foreground">Cada ciclo utiliza créditos de IA. No cambia registros operacionales; guarda el informe y sus revisiones. Las propuestas requieren ejecución humana antes de comprobar su resultado.</p>
      </form>
      {loop.error && <p role="alert" className="text-xs text-danger">{loop.error}</p>}
      {loop.proyectoId && <GoLoopHistory ciclos={loop.ciclos} busy={loop.busy} disabled={disabled} onVerify={ciclo_id => loop.run({ ciclo_id })} onDiscuss={onPrompt} limit={loop.limit} onLoadMore={loop.loadMore} />}
    </div>}
  </details>;
}