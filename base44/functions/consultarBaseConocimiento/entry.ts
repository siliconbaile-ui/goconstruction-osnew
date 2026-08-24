import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { recuperarTramos, verificarCita, codigosNormativos } from '../../shared/recuperacion.ts';

// Q&A técnico con cita verificable. La respuesta se ancla a los tramos que
// devuelve la búsqueda híbrida (semántica + literal de códigos normativos), y
// cada cita se valida contra el texto real del tramo: si el fragmento no existe
// literalmente en el documento, la cita se descarta. Sin cita válida no hay
// respuesta: "No lo sé, consulte al ingeniero."
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const pregunta = (body.pregunta || '').trim();
    if (!pregunta) return Response.json({ error: 'Falta la pregunta técnica a consultar.' }, { status: 400 });

    const tramos = await recuperarTramos(pregunta, {
      proyecto_id: body.proyecto_id || null,
      especialidad: body.especialidad || null,
      topK: 8,
    });

    if (tramos.length === 0) {
      return Response.json({
        sin_respuesta: true,
        respuesta: 'No hay documentación indexada que responda esto. No lo sé, consulte al ingeniero.',
        citas: [],
        confianza: 0,
        codigos_detectados: codigosNormativos(pregunta),
        documentos_consultados: [],
      });
    }

    const contexto = tramos.map((t, i) => `[${i + 1}] Documento: "${t.documento}" · página ${t.pagina || 'sin paginar'}${t.pagina_exacta ? ' (exacta)' : ' (aproximada)'}
Texto:
${t.texto}`).join('\n\n---\n\n');

    const resultado = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Eres el motor de verificación técnica de GoConstruction OS. Respondes preguntas de terreno usando EXCLUSIVAMENTE los tramos de documentación entregados abajo. No usas conocimiento propio.

REGLAS ABSOLUTAS:
1. CERO ALUCINACIONES. Si la respuesta no está explícitamente en los tramos, responde exactamente "No lo sé, consulte al ingeniero." y marca sin_respuesta = true. Jamás estimes una dosificación, recubrimiento, diámetro, resistencia ni cota.
2. Cada cita debe indicar el número de tramo [n] y copiar TEXTUALMENTE (carácter por carácter, sin resumir ni corregir) el fragmento del tramo que respalda la afirmación, entre 12 y 300 caracteres.
3. No inventes ni deduzcas números de página: la página la resuelve el sistema desde el tramo citado.
4. Respuesta breve y operativa, en español de obra chileno, máximo 5 líneas.
5. Si dos tramos se contradicen, dilo y cita ambos: eso es un RDI, no una respuesta.

TRAMOS DE DOCUMENTACIÓN:
${contexto}

PREGUNTA DEL CAPATAZ: ${pregunta}`,
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
                tramo: { type: 'number' },
                fragmento: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Verificación literal: solo sobreviven las citas cuyo fragmento existe de
    // verdad en el tramo, y la página se toma del tramo, no del modelo.
    const citas = (Array.isArray(resultado?.citas) ? resultado.citas : [])
      .map(c => verificarCita(c, tramos))
      .filter(Boolean);

    const exactas = citas.filter(c => c.pagina_exacta && c.pagina);
    const sinRespaldo = citas.length === 0;

    return Response.json({
      respuesta: sinRespaldo && !resultado?.sin_respuesta
        ? 'No pude verificar la página exacta que respalda esta respuesta en la documentación. No lo sé, consulte al ingeniero.'
        : resultado?.respuesta,
      sin_respuesta: !!resultado?.sin_respuesta || sinRespaldo,
      confianza: sinRespaldo ? 0 : (resultado?.confianza ?? 0),
      contradiccion_detectada: !!resultado?.contradiccion_detectada,
      citas,
      citas_con_pagina_exacta: exactas.length,
      // Línea de cierre lista para pegar: nombre del documento + página. GO debe
      // reproducirla textualmente al final de toda respuesta técnica.
      cita_obligatoria: citas.length
        ? `Fuente: ${[...new Set(citas.map(c => c.cita))].join(' · ')}`
        : null,
      codigos_detectados: codigosNormativos(pregunta),
      documentos_consultados: [...new Map(tramos.map(t => [t.documento_id, { id: t.documento_id, titulo: t.documento }])).values()],
      nota: 'OBLIGATORIO: termina la respuesta reproduciendo textualmente cita_obligatoria (nombre del documento + página). Cada cita fue verificada literalmente contra el texto indexado. Cita como exacta SOLO las citas con pagina_exacta = true; si es false, di "página aproximada". Sin cita_obligatoria no entregues el dato: responde "No lo sé, consulte al ingeniero."',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}