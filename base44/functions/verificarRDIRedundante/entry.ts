import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const consulta = (body.consulta || '').trim();
    if (!consulta) return Response.json({ error: 'Falta la consulta a verificar.' }, { status: 400 });

    const query = {};
    if (body.proyecto_id) query.proyecto_id = body.proyecto_id;
    const rdis = await base44.entities.RequerimientoInformacion.filter(query, '-created_date', 150);
    const respondidos = rdis.filter(r => r.respuesta || r.respuesta_sugerida_ia);

    if (respondidos.length === 0) {
      return Response.json({ redundante: false, motivo: 'No hay RDIs respondidos previamente para comparar.', coincidencias: [] });
    }

    const historial = respondidos.map(r => ({
      id: r.id,
      numero_rdi: r.numero_rdi,
      titulo: r.titulo,
      categoria: r.categoria,
      respuesta: (r.respuesta || r.respuesta_sugerida_ia || '').slice(0, 600),
    }));

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Eres el interceptor de RFI/RDI redundantes de GoConstruction OS. Cada RDI innecesario que llega a la oficina técnica cuesta USD $1.000, así que tu trabajo es detectar cuando la consulta YA fue respondida antes.

Consulta nueva del terreno: "${consulta}"

Historial de RDIs ya respondidos en esta obra:
${JSON.stringify(historial)}

Marca redundante = true SOLO si un RDI del historial responde sustantivamente la misma duda técnica (mismo elemento, misma especificación). Similitud temática no basta. Devuelve las coincidencias con su id, número y la respuesta que aplica, y un nivel de similitud 0-100.`,
      response_json_schema: {
        type: 'object',
        properties: {
          redundante: { type: 'boolean' },
          motivo: { type: 'string' },
          coincidencias: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                numero_rdi: { type: 'string' },
                titulo: { type: 'string' },
                respuesta: { type: 'string' },
                similitud: { type: 'number' },
              },
            },
          },
        },
      },
    });

    return Response.json({
      redundante: !!result?.redundante,
      motivo: result?.motivo || '',
      coincidencias: Array.isArray(result?.coincidencias) ? result.coincidencias : [],
      ahorro_estimado_usd: result?.redundante ? 1000 : 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}