// G1 · Aislamiento demo/producción: ninguna automatización debe generar ruido
// sobre proyectos marcados es_demo (ni pausados o en configuración, que aún no
// están operando). Cache por request para no re-leer el mismo proyecto.
const cache = new Map<string, boolean>();

export async function automatizacionPermitida(base44: any, proyecto_id?: string | null) {
  if (!proyecto_id) return { permitida: false, motivo: 'sin proyecto asociado' };
  if (cache.has(proyecto_id)) {
    return cache.get(proyecto_id)
      ? { permitida: true }
      : { permitida: false, motivo: 'proyecto demo, pausado o en configuración' };
  }
  const proyecto = await base44.asServiceRole.entities.ProyectoObra.get(proyecto_id).catch(() => null);
  const ok = !!proyecto && proyecto.es_demo !== true && proyecto.estado === 'activo';
  cache.set(proyecto_id, ok);
  return ok ? { permitida: true, proyecto } : { permitida: false, motivo: 'proyecto demo, pausado o en configuración' };
}