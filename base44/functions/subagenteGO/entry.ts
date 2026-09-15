import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ToolLoopAgent, tool, stepCountIs, hasToolCall } from 'npm:ai@7.0.16';
import { createOpenAICompatible } from 'npm:@ai-sdk/openai-compatible@3.0.5';
import { z } from 'npm:zod@4.4.3';
import { PERFILES, BASE_DOCTRINA } from '../../shared/subagentes.ts';
import { informeSchema, revisarInforme } from '../../shared/goLoopReview.ts';

// Fábrica de subagentes especializados de GO: según la especialidad pedida
// (normativa legal, gestión de costos, calidad, programación o auditoría
// integral) se instancia un analista con su propia doctrina y set de
// herramientas, que ejecuta su loop agéntico y devuelve un informe firmado.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const input = await req.json();
    const anterior = input.ciclo_id ? (await base44.entities.CicloGO.filter({ id: input.ciclo_id, created_by_id: user.id }, '-created_date', 1))[0] : null;
    if (input.ciclo_id && !anterior) return Response.json({ error: 'Ciclo no disponible' }, { status: 404 });
    if (input.modo === 'consultar') {
      if (!anterior) return Response.json({ error: 'ciclo_id requerido' }, { status: 400 });
      return Response.json({ ok: true, ciclo: anterior, informe: anterior.informe });
    }
    const tarea = anterior?.tarea || input.tarea;
    const especialidad = anterior?.especialidad || input.especialidad || 'general';
    const proyecto_id = anterior?.proyecto_id || input.proyecto_id;
    if (typeof tarea !== 'string' || !tarea.trim() || tarea.length > 4000) return Response.json({ error: 'Indica una tarea de hasta 4000 caracteres.' }, { status: 400 });
    if (!proyecto_id) return Response.json({ error: 'Selecciona explícitamente la obra antes de iniciar el ciclo.' }, { status: 400 });
    if (!Object.hasOwn(PERFILES, especialidad)) return Response.json({ error: 'Especialidad no válida' }, { status: 400 });
    const proyecto = (await base44.entities.ProyectoObra.filter({ id: proyecto_id }, '-updated_date', 1))[0];
    if (!proyecto) return Response.json({ error: 'Obra no disponible' }, { status: 404 });
    const perfil = PERFILES[especialidad];
    const ENTIDADES = ['PartidaControl', 'InspeccionCalidad', 'RequerimientoInformacion', 'EstadoPago', 'AlertaSistema', 'ProyectoObra', 'DocumentoTecnico', 'InformeEjecutivo'];
    const evidencias = [], lecturas = {}, revisiones = [];
    let informe = null, borrador = null, entregas = 0;

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
          lecturas[entidad] = (lecturas[entidad] || 0) + 1;
          if (lecturas[entidad] > 2) return { error: 'Límite de dos consultas por entidad; declara el alcance pendiente.' };
          const query = { ...(filtro || {}), ...(entidad === 'ProyectoObra' ? { id: proyecto_id } : { proyecto_id }) };
          const registros = await base44.entities[entidad].filter(query, '-updated_date', 50);
          const serializado = JSON.stringify(registros);
          const resultado = { registros: serializado.slice(0, 20000), muestra_limitada: registros.length === 50 || serializado.length > 20000, limite: 50 };
          evidencias.push({ herramienta: 'leerObra', entidad, consultado_en: new Date().toISOString(), ids: registros.map(r => r.id), resultado });
          return resultado;
        },
      }),
      consultarDocumentos: tool({
        description: 'Busca en los documentos técnicos indexados (EETT, planos, normativa, contratos). Devuelve tramos con documento y página.',
        inputSchema: z.object({ pregunta: z.string() }),
        execute: async ({ pregunta }) => {
          const res = await base44.functions.invoke('buscarConocimientoVectorial', { pregunta, proyecto_id, top_k: 4 });
          evidencias.push({ herramienta: 'consultarDocumentos', pregunta, consultado_en: new Date().toISOString(), resultado: JSON.stringify(res.data).slice(0, 20000) });
          return res.data;
        },
      }),
      entregarInforme: tool({
        description: 'Envía un borrador al revisor independiente. Si devuelve correcciones, corrige y vuelve a entregar; máximo dos entregas.',
        inputSchema: informeSchema,
        execute: async args => {
          if (entregas >= 2) return { ok: false, error: 'Revisión humana necesaria: límite de correcciones.' };
          borrador = args;
          entregas++;
          const revision = evidencias.length ? await revisarInforme(modelos('automatic'), args, evidencias, tarea) : { aprobado: false, observaciones: ['Falta consultar evidencia de esta obra.'] };
          revisiones.push(revision);
          if (revision.aprobado) informe = args;
          return { ok: revision.aprobado, ...revision, intentos_restantes: 2 - entregas };
        },
      }),
    };

    const tools = {};
    for (const nombre of perfil.herramientas) tools[nombre] = todas[nombre];

    const agent = new ToolLoopAgent({
      model: modelos('automatic'),
      instructions: `${perfil.doctrina}\n\n${BASE_DOCTRINA}`,
      tools,
      stopWhen: [stepCountIs(12), () => Boolean(informe) || entregas >= 2],
    });

    let errorEjecucion = '';
    try {
      await agent.generate({ prompt: JSON.stringify({ tarea, proyecto_id, es_demo: proyecto.es_demo === true, informe_anterior: anterior?.informe || null, encargo: anterior ? 'Vuelve a consultar datos actuales, compara cambios con el informe anterior y declara lo que sigue pendiente; no asumas ejecución.' : 'Analiza la misión y entrega un plan verificable; no realices acciones operacionales.' }) });
    } catch (error) { errorEjecucion = error.message; }
    const estado = informe ? 'revision_completada' : borrador ? 'requiere_revision_humana' : 'fallido';
    const ciclo = await base44.entities.CicloGO.create({
      proyecto_id, especialidad, tarea, anterior_id: anterior?.id || '', estado,
      informe: informe || borrador || {}, revision: { intentos: revisiones, aprobado: Boolean(informe), alcance: 'Revisión del informe, no aprobación técnica ni cierre de obra.' },
      evidencias: evidencias.map(({ resultado, ...referencia }) => referencia),
      aprendizaje_propuesto: (informe || borrador)?.aprendizaje_propuesto || '',
      es_demo: proyecto.es_demo === true, error: errorEjecucion || (!informe ? 'El informe no superó la revisión; no debe usarse para autorizar acciones.' : ''),
    });
    return Response.json({ ok: Boolean(informe), subagente: perfil.titulo, especialidad, tarea, informe: informe || borrador, ciclo_id: ciclo.id, estado, revision: ciclo.revision, error: ciclo.error || undefined });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}