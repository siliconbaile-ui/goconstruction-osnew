import { camposEventoGo, firmarEventoGo } from './goAuditoriaStore.ts';

const ENTIDADES = ['ContactoAuditoriaGO', 'TurnoAuditoriaGO', 'EventoAuditoriaGO', 'PerfilOnboardingGO', 'ConocimientoObraGO'];
async function leerTodoGo(db, filtro) {
  const salida = [];
  for (let skip = 0; ; skip += 100) {
    const pagina = await db.filter(filtro, 'created_date', 100, skip);
    salida.push(...pagina);
    if (pagina.length < 100) return salida;
  }
}
export async function exportarAuditoriaGo(base44, grupo, sesion = '', entorno = 'dev') {
  const filtro = { entorno, grupo_prueba: grupo };
  const registros = Object.fromEntries(await Promise.all(ENTIDADES.map(async nombre => [nombre, await leerTodoGo(base44.asServiceRole.entities[nombre], filtro)])));
  const eventos = registros.EventoAuditoriaGO;
  const integridad = await Promise.all(eventos.map(async e => ({ id: e.id, valida: e.firma_integridad === await firmarEventoGo(camposEventoGo(e)) })));
  const turnos = registros.TurnoAuditoriaGO.filter(t => !sesion || t.sesion_id === sesion);
  const transcripciones = turnos.map(t => ({ turno_id: t.id, persona_id: t.persona_id, sesion_id: t.sesion_id,
    wamid_entrada: t.wamid, timestamp_entrada: t.timestamp_mensaje, telefono_normalizado: t.telefono_normalizado,
    usuario: t.entrada, go: t.resultado?.respuesta ?? null, botones: t.resultado?.opciones || [],
    audio: t.resultado?.audio || null, socratico: t.resultado?.socratico || null,
    origen_respuesta: t.resultado?.origen || (t.agent_message_id ? 'orion_asistente' : null),
    conversation_id: t.conversation_id || null, agent_message_id: t.agent_message_id || null,
    wamid_salida: t.wamid_salida || null, timestamp_salida: t.resultado?.timestamp_salida || null,
    estado: t.estado, error: t.error || null, auditoria_ids: eventos.filter(e => e.turno_id === t.id).map(e => e.id) }));
  const informe = { generado: new Date().toISOString(), entorno, grupo_id: grupo, sesion_id: sesion || null,
    envio_whatsapp: entorno === 'prod', wamid_sintetico: entorno === 'dev', transcripciones, registros, integridad,
    limites: ['No constituye una prueba E2E por sí solo.', 'Idempotencia por consulta y serialización local, no transacción entre workers.',
      'El filtro preventivo de solicitudes privadas no sustituye aislamiento de todas las herramientas del agente.'] };
  const archivo = new File([JSON.stringify(informe, null, 2)], `auditoria-go-${grupo}.json`, { type: 'application/json' });
  const { file_uri } = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: archivo });
  const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 3600 });
  return { archivo_completo: signed_url, file_uri, data_env: entorno, grupo_id: grupo, envio_whatsapp: entorno === 'prod',
    turnos: transcripciones.length, registros: Object.fromEntries(ENTIDADES.map(nombre => [nombre, registros[nombre].map(r => ({ id: r.id, tipo: r.tipo || r.estado || null }))])),
    integridad_valida: integridad.every(r => r.valida), transcripciones };
}