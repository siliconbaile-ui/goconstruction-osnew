import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useGoLoop() {
  const [proyectoId, setProyectoId] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [limit, setLimit] = useState(10);
  const cache = useQueryClient();
  useEffect(() => base44.entities.CicloGO.subscribe(() => { cache.invalidateQueries({ queryKey: ['go-loop-ciclos'] }); }), [cache]);
  const proyectos = useQuery({ queryKey: ['go-loop-proyectos'], queryFn: () => base44.entities.ProyectoObra.list('-updated_date', 100) });
  const ciclos = useQuery({ queryKey: ['go-loop-ciclos', proyectoId, limit], enabled: Boolean(proyectoId), queryFn: () => base44.entities.CicloGO.filter({ proyecto_id: proyectoId }, '-created_date', limit) });
  const run = async payload => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { data } = await base44.functions.invoke('subagenteGO', { proyecto_id: proyectoId, ...payload });
      await cache.invalidateQueries({ queryKey: ['go-loop-ciclos'] });
      if (!data.ok) setError(data.error || 'El informe requiere revisión humana; puedes consultar el resultado guardado.');
    } catch (e) { setError(e.response?.data?.error || e.message || 'No se pudo completar el ciclo.'); }
    finally { setBusy(false); }
  };
  return { proyectoId, setProyectoId, proyectos, ciclos, busy, error, run, limit, loadMore: () => setLimit(v => v + 10) };
}