import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const pregunta = (body.pregunta || '').trim();
    if (!pregunta) return Response.json({ error: 'Falta la pregunta técnica a consultar.' }, { status: 400 });

    const query = { vigente: true, estado_indexacion: 'indexado' };
    if (body.proyecto_id) query.proyecto_id = body.proyecto_id;
    if (body.especialidad) query.especialidad = body.especialidad;

    let docs = await base44.entities.DocumentoTecnico.filter(query, '-updated_date', 40);

    if (docs.length === 0) {
      return Response.json({
        sin_respuesta: true,
        respuesta: 'No hay documentos técnicos indexados para esta obra. No lo sé, consulte al ingeniero.',
        citas: [],
        confianza: 0,
        documentos_consultados: 0,
      });
    }

    // Preselección por relevancia usando el índice de contenido (evita mandar gigabytes al modelo)
    const catalogo = docs.map((d, i) => ({
      i,
      titulo: d.titulo,
      tipo: d.tipo,
      especialidad: d.especialidad,
      resumen: (d.resumen || '').slice(0, 400),
      indice: (d.indice_contenido || '').slice(0, 1200),
    }));

    let seleccion = docs.slice(0, 4);
    if (docs.length > 4) {
      const pick = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Pregunta técnica de terreno: "${pregunta}"

Catálogo de documentos técnicos disponibles (con su índice de contenido y páginas):
${JSON.stringify(catalogo)}

Devuelve los índices (campo "i") de hasta 4 documentos que con mayor probabilidad contienen la respuesta. Solo los índices, ordenados por relevancia.`,
        response_json_schema: {
          type: 'object',
          properties: { indices: { type: 'array', items: { type: 'number' } } },
        },
      });
      const idx = Array.isArray(pick?.indices) ? pick.indices.filter(n => docs[n]) : [];
      if (idx.length > 0) seleccion = idx.slice(0, 4).map(n => docs[n]);
    }

    const resultado = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Eres el motor de verificación técnica de GoConstruction OS. Respondes preguntas de terreno consultando EXCLUSIVAMENTE los documentos adjuntos (planos, EETT, normativas, protocolos).

REGLAS ABSOLUTAS E INNEGOCIABLES:
1. CERO ALUCINACIONES. Si la respuesta no está explícitamente en los documentos adjuntos, responde exactamente: "No lo sé, consulte al ingeniero." y marca sin_respuesta = true. Jamás inventes ni estimes una especificación estructural, dosificación, diámetro, recubrimiento o cota.
2. CITA OBLIGATORIA. Toda afirmación técnica debe venir con la cita del documento y la PÁGINA EXACTA donde aparece. Una respuesta sin página no tiene validez en terreno.
3. Cita textualmente el fragmento clave de la especificación (máximo 2 líneas) para que el capataz pueda verificarlo en el documento físico.
4. Respuesta breve y operativa, en español de obra chileno, máximo 5 líneas. Sin rodeos ni disclaimers largos.
5. Si dos documentos se contradicen, dilo explícitamente y cita ambos: eso es un RDI, no una respuesta.

Documentos adjuntos, en orden:
${seleccion.map((d, i) => `[${i + 1}] "${d.titulo}" · tipo: ${d.tipo} · especialidad: ${d.especialidad}${d.version ? ` · versión ${d.version}` : ''}`).join('\n')}

PREGUNTA DEL CAPATAZ: ${pregunta}`,
      file_urls: seleccion.map(d => d.file_url),
      response_json_schema: {
        type: 'object',
        properties: {
          respuesta: { type: 'string' },
          sin_respuesta: { type: 'boolean' },
          confianza: { type: 'number' },
          contradiccion_detectada: { type: 'boolean' },
          citas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                documento: { type: 'string' },
                pagina: { type: 'string' },
                fragmento: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const citas = Array.isArray(resultado?.citas) ? resultado.citas : [];
    const sinCita = citas.length === 0;

    return Response.json({
      respuesta: sinCita && !resultado?.sin_respuesta
        ? 'No pude ubicar la página exacta que respalda esta respuesta. No lo sé, consulte al ingeniero.'
        : resultado?.respuesta,
      sin_respuesta: !!resultado?.sin_respuesta || sinCita,
      confianza: sinCita ? 0 : (resultado?.confianza ?? 0),
      contradiccion_detectada: !!resultado?.contradiccion_detectada,
      citas,
      documentos_consultados: seleccion.map(d => ({ id: d.id, titulo: d.titulo, tipo: d.tipo })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}