import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { embeddings, consultarVectores, grafo } from '../../shared/conocimiento.ts';

// Búsqueda semántica en el cerebro de GO: tramos relevantes de EETT, planos y
// normativa (Pinecone) + contexto de relaciones del grafo (Neo4j).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { pregunta, proyecto_id = null, especialidad = null, top_k = 6 } = await req.json();
    if (!pregunta?.trim()) return Response.json({ error: 'pregunta requerida' }, { status: 400 });

    const [vector] = await embeddings([pregunta], 'query');
    const tramos = await consultarVectores(vector, {
      topK: top_k,
      namespace: proyecto_id || 'obra',
      filtro: especialidad ? { especialidad: { $eq: especialidad } } : null,
    });

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
    } catch (e) {
      relaciones = [];
    }

    return Response.json({
      pregunta,
      encontrados: tramos.length,
      tramos: tramos.map(t => ({
        documento: t.titulo,
        documento_id: t.documento_id,
        especialidad: t.especialidad,
        pagina_aprox: t.pagina_aprox,
        relevancia: Number((t.score || 0).toFixed(3)),
        texto: t.texto,
      })),
      relaciones,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}