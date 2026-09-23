// Investigación entregada al GO real para co-diseñar; no ejecuta acciones sobre obras.
export async function codisenarOnboardingGo(base44, input = {}) {
  const agents = base44.asServiceRole.agents;
  if (input.conversation_id) {
    const anterior = await agents.getConversation(input.conversation_id);
    if (anterior.metadata?.canal !== 'kapso_codiseno' || anterior.metadata?.entorno !== 'dev') throw new Error('No es un co-diseño de desarrollo.');
    const mensaje = anterior.messages.filter(m => m.role === 'assistant' && m.content && !m.tool_calls?.length).at(-1);
    const propuesta = JSON.parse(mensaje.content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, ''));
    const seccion = String(input.seccion || 'estados');
    const items = propuesta[seccion];
    return { ok: true, conversation_id: anterior.id, seccion, total: items?.length,
      items: Array.isArray(items) ? items.slice(Number(input.desde) || 0, (Number(input.desde) || 0) + 2) : items };
  }
  const conversacion = await agents.createConversation({ agent_name: 'orion_asistente', metadata: {
    name: 'GO · co-diseño onboarding WhatsApp', canal: 'kapso_codiseno', entorno: 'dev',
  } });
  await agents.addMessage(conversacion, { role: 'user', content: `Encargo de diseño aprobado por Diego: co-diseña tu único onboarding orgánico por WhatsApp, sin cambiar tu identidad, instrucciones ni herramientas. Esta es una revisión de producto en desarrollo, NO una misión sobre una obra: no consultes ni modifiques datos operacionales ni uses herramientas. Usa exclusivamente esta investigación de código y tus capacidades configuradas.
HECHOS VERIFICADOS: PublicStart ofrece WhatsApp sin registro; Demo es snapshot curado BES-2026-01, solo lectura. ProyectoObra y PartidaControl sostienen obra/frente/avance; InspeccionCalidad evidencias y NC; RequerimientoInformacion RDI; EstadoPago pagos; DocumentoTecnico planos/EETT; ConversacionMeta y tu historial permiten retomar contexto. User.telefono es declarado, NO identidad verificada ni permiso.
HERRAMIENTAS Y LÍMITES REALES: guardarEvidencia crea inspección de foto o documento con indexación; no usar sin obra explícita y permiso. consultarBaseConocimiento verifica citas; buscarConocimientoVectorial es híbrida; la recuperación actual puede ampliar a namespace general obra, por lo que NO prueba aislamiento privado. verificarRDIRedundante compara RDIs; su ahorro de USD1000 es estimación heredada NO beneficio comprobado. validarEDPCalidad ESCRIBE verificaciones/bloqueo/alerta, no es consulta inocua. verificarCierreNC actualmente comprueba si ya cerró y, si no, crea alerta; NO cierra NC ni libera pagos pese a su descripción. subagenteGO analiza/revisa y guarda CicloGO, no ejecuta operaciones. grafoObra no se renderiza en WhatsApp. No hay transferencia automática verificada a un humano por este puente. El bridge actual usa service role y no vincula el remitente a una sesión autorizada: no podemos prometer acceso privado solo por reconocer el teléfono.
RECORRIDO: presentación natural de una línea como jefe técnico que acompaña la obra → qué está pasando hoy, sin menú ni especialidad impuesta → entender frente/obra progresivamente → evidencia → análisis real cuando sea posible → un hallazgo y una acción verificable → elección natural si aporta → seguimiento y cierre dejando al usuario operando en el mismo hilo. Nuevo sin obra; conocido con contexto declarado vs autorización efectiva; foto; audio con/sin transcripción; texto; botones; evidencia insuficiente; urgencia; derivación humana. Una idea y una pregunta O petición por turno, 1–3 líneas, objetivo <=360 caracteres; botones humanos 0–3, <=20 caracteres. No checklist ni menú recurrente. Cero discurso de venta, demo, funnel o piloto; nunca calificar prospectos ni pedir datos comerciales. Avanza desde la respuesta libre y usa botones solo si ayudan a una decisión operativa. No exigir registro para conversar; no acceso a obras privadas sin vínculo verificado. No usar genérico InvokeLLM en el adaptador.
Propón estados y transiciones flexibles, qué conservar en contexto sin otorgar permisos, tratamiento de cada rama, y un camino feliz de 6–8 turnos con cierre operativo. Distingue lo implementable solo en narrativa de los bloqueos de autorización/media. Devuelve JSON con claves decisiones (array), estados (array), ramas (array), camino_feliz (array), limites (array). No guardes esto como aprendizaje de obra.` });
  const limite = Date.now() + 75000;
  do {
    const actual = await agents.getConversation(conversacion.id);
    const ultimo = actual.messages?.at(-1);
    if (ultimo?.role === 'assistant' && ultimo.content && !ultimo.tool_calls?.length && (ultimo.usage || ultimo.checkpoint_id)) {
      const herramientas = actual.messages.flatMap(m => (m.tool_calls || []).map(t => t.name));
      return { ok: true, data_env: 'dev', agente: actual.agent_name, conversation_id: actual.id,
        message_id: ultimo.id, herramientas, propuesta: ultimo.content };
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  } while (Date.now() < limite);
  throw new Error(`Co-diseño pendiente en conversación ${conversacion.id}`);
}