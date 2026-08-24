import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ToolLoopAgent, tool, stepCountIs, hasToolCall } from 'npm:ai@7.0.16';
import { createOpenAICompatible } from 'npm:@ai-sdk/openai-compatible@3.0.5';
import { z } from 'npm:zod@4.4.3';

// Subagente de análisis profundo de GO: recibe una tarea acotada
// (auditoría de partida, causa raíz de bloqueo, cruce avance/calidad/pagos)
// y ejecuta su propio loop agéntico sobre los datos de la obra,
// devolviendo un informe estructurado que GO reporta en una línea + tabla.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { tarea, proyecto_id = null } = await req.json();
    if (!tarea?.trim()) return Response.json({ error: 'tarea requerida' }, { status: 400 });

    const ENTIDADES = ['PartidaControl', 'InspeccionCalidad', 'RequerimientoInformacion', 'EstadoPago', 'AlertaSistema', 'ProyectoObra'];
    let informe = null;

    const { baseURL, token } = base44.asServiceRole.aiGateway.connection();
    const modelos = createOpenAICompatible({ name: 'base44', baseURL, apiKey: token });

    const agent = new ToolLoopAgent({
      model: modelos('automatic'),
      instructions:
        'Eres un subagente de análisis de obra chilena. Ejecuta SOLO la tarea encomendada. ' +
        'Consulta las entidades que necesites (máximo 2 lecturas por entidad), cruza los datos ' +
        '(una NC crítica abierta explica un EDP bloqueado; desviación = programado - real), ' +
        'cifra impacto en USD y días, y entrega el informe con entregarInforme UNA sola vez. ' +
        'Si un dato no existe, decláralo como hallazgo, nunca lo inventes. ' +
        'Si la tarea requiere norma o EETT, usa consultarDocumentos y cita documento y página.',
      tools: {
        leerObra: tool({
          description: 'Lee registros de una entidad de la obra. Filtro opcional por campos exactos (ej: {"estado":"abierta"}).',
          inputSchema: z.object({
            entidad: z.enum(ENTIDADES),
            filtro: z.record(z.string(), z.any()).optional(),
          }),
          execute: async ({ entidad, filtro }) => {
            const query = { ...(filtro || {}) };
            if (proyecto_id && entidad !== 'ProyectoObra') query.proyecto_id = proyecto_id;
            const rows = await base44.entities[entidad].filter(query, '-updated_date', 50);
            return rows;
          },
        }),
        consultarDocumentos: tool({
          description: 'Busca en los documentos técnicos indexados (EETT, planos, normativa). Devuelve tramos con cita de documento y página.',
          inputSchema: z.object({ pregunta: z.string() }),
          execute: async ({ pregunta }) => {
            const res = await base44.functions.invoke('buscarConocimientoVectorial', { pregunta, proyecto_id, top_k: 4 });
            return res.data;
          },
        }),
        entregarInforme: tool({
          description: 'Entrega el informe final. Llámala una sola vez, al terminar el análisis.',
          inputSchema: z.object({
            titulo: z.string(),
            sintesis: z.string().describe('Una línea con el dato clave'),
            hallazgos: z.array(z.object({
              hallazgo: z.string(),
              severidad: z.enum(['ok', 'advertencia', 'critica']),
              impacto: z.string().describe('Impacto en USD y/o días; "sin impacto cuantificable" si no aplica'),
            })).max(6),
            acciones: z.array(z.string()).max(4),
            fuentes: z.array(z.string()).describe('Documento y página si se usaron documentos; vacío si solo datos de plataforma'),
          }),
          execute: (args) => { informe = args; return { ok: true }; },
        }),
      },
      stopWhen: [stepCountIs(12), hasToolCall('entregarInforme')],
    });

    await agent.generate({ prompt: `Tarea encomendada: ${tarea}${proyecto_id ? ` (proyecto_id: ${proyecto_id})` : ''}` });

    if (!informe) {
      return Response.json({ ok: false, error: 'El subagente no alcanzó a cerrar el informe. Reintenta con una tarea más acotada.' });
    }
    return Response.json({ ok: true, tarea, informe });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}