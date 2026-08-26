import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import GrafoInteractivo from './GrafoInteractivo';
import { Loader2 } from 'lucide-react';

// El resultado de grafoObra puede llegar truncado dentro de la conversación
// (grafos grandes). Este componente re-pide el grafo directo a la función
// con los mismos parámetros y lo dibuja completo e interactivo.
export default function GrafoDesdeFuncion({ args }) {
  const [estado, setEstado] = useState({ cargando: true });

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const payload = args?.payload || args || {};
        const res = await base44.functions.invoke('grafoObra', payload);
        const data = res?.data || res;
        if (vivo) setEstado({ cargando: false, grafo: data?.grafo, resumen: data?.resumen });
      } catch {
        if (vivo) setEstado({ cargando: false });
      }
    })();
    return () => { vivo = false; };
  }, []);

  if (estado.cargando) {
    return (
      <div className="flex items-center gap-2 py-3 text-[11px] font-mono text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> DIBUJANDO GRAFO DE OBRA...
      </div>
    );
  }
  if (!estado.grafo?.nodos?.length) return null;
  return <GrafoInteractivo grafo={estado.grafo} resumen={estado.resumen} />;
}