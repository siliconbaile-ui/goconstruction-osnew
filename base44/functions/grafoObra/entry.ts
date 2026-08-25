import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { grafo } from '../../shared/conocimiento.ts';
import { sincronizarGrafo, cypherPorModo, normalizar } from '../../shared/grafoObra.ts';

// Devuelve el grafo de conocimiento de la obra listo para dibujar y explicar:
// sincroniza el estado real de la plataforma en Neo4j y consulta la vecindad
// pedida (panorama, riesgo, pagos, calidad o foco en un nodo).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    let { proyecto_id = null, modo = 'obra', foco = null, sincronizar = true } = body;

    if (!proyecto_id) {
      const activos = await base44.asServiceRole.entities.ProyectoObra.filter({ estado: 'activo' }, '-updated_date', 1);
      proyecto_id = activos[0]?.id;
      if (!proyecto_id) return Response.json({ error: 'No hay obra activa. Indica proyecto_id.' }, { status: 400 });
    }

    let sync = null;
    if (sincronizar) sync = await sincronizarGrafo(base44, proyecto_id);

    if (foco) modo = 'foco';
    const filas = await grafo(cypherPorModo(modo), { proyecto: proyecto_id, foco: foco || '' });
    const g = normalizar(filas);

    if (g.nodos.length === 0) {
      return Response.json({
        ok: false,
        error: foco
          ? `No hay nodos en el grafo que coincidan con "${foco}".`
          : 'El grafo de esta obra está vacío. Carga partidas, inspecciones o documentos.',
      });
    }

    const criticos = g.nodos.filter(n => n.severidad === 'critica');
    const porTipo = g.nodos.reduce((acc: any, n: any) => { acc[n.tipo] = (acc[n.tipo] || 0) + 1; return acc; }, {});
    const bloqueos = g.aristas.filter(a => a.rel === 'BLOQUEA').length;

    return Response.json({
      ok: true,
      grafo: { ...g, modo, foco, proyecto_id },
      resumen: {
        nodos: g.nodos.length,
        aristas: g.aristas.length,
        criticos: criticos.length,
        bloqueos_calidad_pago: bloqueos,
        por_tipo: porTipo,
        nodos_criticos: criticos.slice(0, 6).map(n => `${n.tipo}: ${n.label} — ${n.detalle}`),
      },
      sincronizacion: sync,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}