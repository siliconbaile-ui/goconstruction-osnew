import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { scrapeUrl, embeddings, upsertVectores, grafo, trocearTexto } from '../../shared/conocimiento.ts';
import { paginasPorTramo, codigosNormativos } from '../../shared/hibrido.ts';

// Indexa un documento técnico (PDF de EETT, plano, normativa, ficha) en el
// cerebro de GO: vectores en Pinecone para búsqueda semántica + nodos en el
// grafo Neo4j para relaciones (documento → especialidad → partida → norma).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      documento_id, url, texto, titulo = 'Documento', proyecto_id = null,
      especialidad = 'general', tipo = 'otro', partidas = [], normas = [],
    } = await req.json();

    let contenido = texto || '';
    let tituloFinal = titulo;
    let paginas = null;

    if (!contenido && url) {
      const data = await scrapeUrl(url, { soloPrincipal: false });
      contenido = data.markdown || '';
      tituloFinal = data.metadata?.title || titulo;
      paginas = data.metadata?.numPages || null;
    }
    if (!contenido.trim()) {
      return Response.json({ error: 'Sin contenido para indexar (envía url o texto)' }, { status: 400 });
    }

    const tramos = trocearTexto(contenido).slice(0, 120);
    const base = documento_id || `doc-${Date.now()}`;
    // Página real por tramo (marcador del PDF) y códigos normativos citables.
    const paginacion = paginasPorTramo(tramos, paginas || 0);

    // Vectores por lotes de 40
    let indexados = 0;
    for (let i = 0; i < tramos.length; i += 40) {
      const lote = tramos.slice(i, i + 40);
      const vectores = await embeddings(lote, 'passage');
      await upsertVectores(lote.map((t, j) => ({
        id: `${base}-${i + j}`,
        values: vectores[j],
        metadata: {
          documento_id: base,
          titulo: tituloFinal,
          proyecto_id: proyecto_id || '',
          especialidad,
          tipo,
          tramo: i + j,
          pagina: paginacion[i + j].pagina,
          pagina_exacta: paginacion[i + j].exacta,
          pagina_aprox: paginacion[i + j].pagina,
          codigos: codigosNormativos(t).slice(0, 12),
          texto: t.slice(0, 3000),
        },
      })), proyecto_id || 'obra');
      indexados += lote.length;
    }

    // Grafo de conocimiento
    await grafo(
      `MERGE (d:Documento {id: $id})
       SET d.titulo = $titulo, d.tipo = $tipo, d.url = $url, d.proyecto = $proyecto, d.tramos = $tramos
       MERGE (e:Especialidad {nombre: $especialidad})
       MERGE (d)-[:DE_ESPECIALIDAD]->(e)
       WITH d
       UNWIND $partidas AS p
       MERGE (pa:Partida {nombre: p})
       MERGE (d)-[:APLICA_A]->(pa)`,
      { id: base, titulo: tituloFinal, tipo, url: url || '', proyecto: proyecto_id || '', tramos: tramos.length, especialidad, partidas }
    );

    if (normas.length > 0) {
      await grafo(
        `MATCH (d:Documento {id: $id})
         UNWIND $normas AS n
         MERGE (no:Norma {codigo: n})
         MERGE (d)-[:REFERENCIA]->(no)`,
        { id: base, normas }
      );
    }

    if (documento_id) {
      // RLS nativa: usa el SDK de usuario (no asServiceRole) para que las reglas
      // de propiedad se apliquen — solo el creador o un admin puede actualizar.
      const doc = await base44.entities.DocumentoTecnico.get(documento_id).catch(() => null);
      if (!doc) return Response.json({ error: 'Documento no encontrado o sin permisos' }, { status: 404 });
      await base44.entities.DocumentoTecnico.update(documento_id, {
        estado_indexacion: 'indexado',
        paginas_totales: paginas || undefined,
      });
    }

    return Response.json({ ok: true, documento_id: base, tramos_indexados: indexados, paginas, grafo: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}