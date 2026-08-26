import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ToolLoopAgent, tool, stepCountIs, hasToolCall } from 'npm:ai@7.0.16';
import { createOpenAICompatible } from 'npm:@ai-sdk/openai-compatible@3.0.5';
import { z } from 'npm:zod@4.4.3';
import { PERFILES, BASE_DOCTRINA } from '../../shared/subagentes.ts';

// Fábrica de subagentes especializados de GO: según la especialidad pedida
// (normativa legal, gestión de costos, calidad, programación o auditoría
// integral) se instancia un analista con su propia doctrina y set de
// herramientas, que ejecuta su loop agéntico y devuelve un informe firmado.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { tarea, especialidad = 'general', proyecto_id = null } = await req.json();
    if (!tarea?.trim()) return Response.json({ error: 'tarea requerida' }, { status: 400 });

    const perfil = PERFILES[especialidad] || PERFILES.general;
    const ENTIDADES = ['PartidaControl', 'InspeccionCalidad', 'RequerimientoInformacion', 'EstadoPago', 'AlertaSistema', 'ProyectoObra', 'DocumentoTecnico'];
    let informe = null;

    const { baseURL, token } = base44.asServiceRole.aiGateway.connection();
    const modelos = createOpenAICompatible({ name: 'base44', baseURL, apiKey: token });

    const todas = {
      leerObra: tool({
        description: 'Lee registros de una entidad de la obra. Filtro opcional por campos exactos (ej: {"estado":"abierta"}).',
        inputSchema: z.object({
          entidad: z.enum(ENTIDADES),
          filtro: z.record(z.string(), z.any()).optional(),
        }),
        execute: async ({ entidad, filtro }) => {
          const query = { ...(filtro || {}) };
          if (proyecto_id && entidad !== 'ProyectoObra') query.proyecto_id = proyecto_id;
          return await base44.entities[entidad].filter(query, '-updated_date', 50);
        },
      }),
      consultarDocumentos: tool({
        description: 'Busca en los documentos técnicos indexados (EETT, planos, normativa, contratos). Devuelve tramos con documento y página.',
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
          fuentes: z.array(z.string()).describe('Cada fuente en formato "Fuente: <documento>, p. <número>". Obligatorio para todo hallazgo apoyado en un documento; en análisis normativo nunca va vacío (usa "Fuente: memoria normativa (sin documento indexado)" si no hay documento).'),
        }),
        execute: (args) => { informe = args; return { ok: true }; },
      }),
    };

    const tools = {};
    for (const nombre of perfil.herramientas) tools[nombre] = todas[nombre];

    const agent = new ToolLoopAgent({
      model: modelos('automatic'),
      instructions: `${perfil.doctrina}\n\n${BASE_DOCTRINA}`,
      tools,
      stopWhen: [stepCountIs(12), hasToolCall('entregarInforme')],
    });

    await agent.generate({ prompt: `Tarea encomendada: ${tarea}${proyecto_id ? ` (proyecto_id: ${proyecto_id})` : ''}` });

    if (!informe) {
      return Response.json({ ok: false, subagente: perfil.titulo, error: 'El subagente no alcanzó a cerrar el informe. Reintenta con una tarea más acotada.' });
    }
    return Response.json({ ok: true, subagente: perfil.titulo, especialidad, tarea, informe });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}