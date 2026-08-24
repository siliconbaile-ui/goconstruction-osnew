import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { embeddings, consultarVectores, grafo } from '../../shared/conocimiento.ts';
import { fusionHibrida, paginaDeTexto, codigosNormativos } from '../../shared/hibrido.ts';

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

    const [vector] = await embeddings([pregunta], 'query');
    const filtro = especialidad ? { especialidad: { $eq: especialidad } } : null;
    const recall = Math.max(30, top_k * 6);

    // Candidatos del namespace del proyecto y, si viene corto, también del general.
    let candidatos = await consultarVectores(vector, { topK: recall, namespace: proyecto_id || 'obra', filtro });
    if (proyecto_id && candidatos.length < recall / 2) {
      const generales = await consultarVectores(vector, { topK: recall, namespace: 'obra', filtro });
      candidatos = [...candidatos, ...generales];
    }

    const tramos = fusionHibrida(candidatos, pregunta, top_k);

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
      tramos: tramos.map(t => {
        const enTexto = paginaDeTexto(t.texto || '');
        const pagina = enTexto || (t.pagina_exacta ? t.pagina : 0) || t.pagina || t.pagina_aprox || 0;
        const exacta = !!(enTexto || t.pagina_exacta);
        return {
          documento: t.titulo,
          documento_id: t.documento_id,
          especialidad: t.especialidad,
          pagina,
          pagina_exacta: exacta,
          cita: pagina
            ? `${t.titulo}, p. ${pagina}${exacta ? '' : ' (aprox.)'}`
            : `${t.titulo} (sin paginación en el archivo)`,
          relevancia_semantica: Number((t.score || 0).toFixed(3)),
          coincidencia_literal: Number((t.lexico || 0).toFixed(3)),
          texto: t.texto,
        };
      }),
      relaciones,
      nota: 'Cita SOLO páginas marcadas como pagina_exacta. Si pagina_exacta es false, indica que la página es aproximada o responde "No lo sé, consulte al ingeniero."',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}