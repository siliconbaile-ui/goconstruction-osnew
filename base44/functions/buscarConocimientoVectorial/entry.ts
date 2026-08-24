import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { grafo } from '../../shared/conocimiento.ts';
import { recuperarTramos, codigosNormativos } from '../../shared/recuperacion.ts';

// Búsqueda HÍBRIDA en el cerebro de GO: recall semántico amplio (Pinecone) +
// re-ranking léxico sobre códigos normativos y cifras (NCh, OGUC, art., f'c),
// más el contexto de relaciones del grafo (Neo4j). Devuelve la cita con página.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { pregunta, proyecto_id = null, especialidad = null, top_k = 6 } = await req.json();
    if (!pregunta?.trim()) return Response.json({ error: 'pregunta requerida' }, { status: 400 });

    const tramos = await recuperarTramos(pregunta, { proyecto_id, especialidad, topK: top_k });

    let relaciones = [];
    try {
      const ids = tramos.map(t => t.documento_id).filter(Boolean);
      if (ids.length > 0) {
        relaciones = await grafo(
          `MATCH (d:Documento)-[r]->(n)
           WHERE d.id IN $ids
           RETURN d.titulo AS documento, type(r) AS relacion, coalesce(n.nombre, n.codigo, n.id) AS nodo
           LIMIT 25`,
          { ids }
        );
      }
    } catch {
      relaciones = [];
    }

    return Response.json({
      pregunta,
      codigos_detectados: codigosNormativos(pregunta),
      encontrados: tramos.length,
      tramos,
      relaciones,
      nota: 'Cita SOLO páginas marcadas como pagina_exacta. Si pagina_exacta es false, indica que la página es aproximada o responde "No lo sé, consulte al ingeniero."',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}