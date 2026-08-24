import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { scrapeUrl, embeddings, upsertVectores, grafo, trocearTexto } from '../../shared/conocimiento.ts';

// Ingesta automática de archivos que llegan por WhatsApp o chat:
// - foto  → InspeccionCalidad con evidencia_foto_url y GPS
// - documento → DocumentoTecnico + indexación en Pinecone y grafo Neo4j
// Todo queda asignado al proyecto (el indicado, o el proyecto activo).
const IMAGEN = /\.(jpe?g|png|heic|webp|gif)(\?|$)/i;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      file_urls = [], file_url, tipo, proyecto_id, partida_id = null,
      titulo = null, descripcion = null, especialidad = 'general',
      coordenadas_gps = null, gravedad = 'leve',
    } = await req.json();

    const urls = file_urls.length > 0 ? file_urls : (file_url ? [file_url] : []);
    if (urls.length === 0) return Response.json({ error: 'Falta file_url' }, { status: 400 });

    let proyecto = proyecto_id;
    if (!proyecto) {
      const activos = await base44.asServiceRole.entities.ProyectoObra.filter({ estado: 'activo' }, '-updated_date', 1);
      const cualquiera = activos.length ? activos : await base44.asServiceRole.entities.ProyectoObra.list('-updated_date', 1);
      proyecto = cualquiera[0]?.id;
    }
    if (!proyecto) return Response.json({ error: 'No hay proyecto al que asignar la evidencia' }, { status: 400 });

    const registros = [];

    for (const url of urls) {
      const esFoto = tipo === 'foto' || (!tipo && IMAGEN.test(url));

      if (esFoto) {
        const insp = await base44.asServiceRole.entities.InspeccionCalidad.create({
          proyecto_id: proyecto,
          partida_id: partida_id || 'sin_asignar',
          tipo: 'foto',
          gravedad,
          estado: 'abierta',
          descripcion: descripcion || 'Evidencia fotográfica recibida por WhatsApp',
          inspector: user.full_name || user.email,
          evidencia_foto_url: url,
          coordenadas_gps,
        });
        registros.push({ clase: 'inspeccion', id: insp.id, url });
        continue;
      }

      const doc = await base44.asServiceRole.entities.DocumentoTecnico.create({
        proyecto_id: proyecto,
        titulo: titulo || url.split('/').pop()?.slice(0, 120) || 'Documento recibido',
        tipo: tipo && tipo !== 'foto' ? tipo : 'otro',
        especialidad,
        file_url: url,
        nombre_archivo: url.split('/').pop() || null,
        estado_indexacion: 'indexando',
        notas: descripcion,
      });
      registros.push({ clase: 'documento', id: doc.id, url });

      // Indexación best-effort: si el archivo no es legible, queda marcado con error.
      try {
        const data = await scrapeUrl(url, { soloPrincipal: false });
        const tramos = trocearTexto(data.markdown || '').slice(0, 120);
        if (tramos.length === 0) throw new Error('Sin texto extraíble');
        const paginas = data.metadata?.numPages || null;
        for (let i = 0; i < tramos.length; i += 40) {
          const lote = tramos.slice(i, i + 40);
          const vectores = await embeddings(lote, 'passage');
          await upsertVectores(lote.map((t, j) => ({
            id: `${doc.id}-${i + j}`,
            values: vectores[j],
            metadata: {
              documento_id: doc.id,
              titulo: doc.titulo,
              proyecto_id: proyecto,
              especialidad,
              tipo: doc.tipo,
              tramo: i + j,
              pagina_aprox: paginas ? Math.max(1, Math.round(((i + j + 1) / tramos.length) * paginas)) : 0,
              texto: t.slice(0, 3000),
            },
          })), proyecto);
        }
        await grafo(
          `MERGE (d:Documento {id: $id})
           SET d.titulo = $titulo, d.tipo = $tipo, d.url = $url, d.proyecto = $proyecto, d.tramos = $tramos
           MERGE (e:Especialidad {nombre: $especialidad})
           MERGE (d)-[:DE_ESPECIALIDAD]->(e)`,
          { id: doc.id, titulo: doc.titulo, tipo: doc.tipo, url, proyecto, tramos: tramos.length, especialidad }
        );
        await base44.asServiceRole.entities.DocumentoTecnico.update(doc.id, {
          estado_indexacion: 'indexado',
          paginas_totales: paginas || undefined,
        });
        registros[registros.length - 1].tramos_indexados = tramos.length;
      } catch (e) {
        await base44.asServiceRole.entities.DocumentoTecnico.update(doc.id, { estado_indexacion: 'error', notas: e.message });
        registros[registros.length - 1].error_indexacion = e.message;
      }
    }

    return Response.json({ ok: true, proyecto_id: proyecto, registros });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}