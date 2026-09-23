import { hashGo, PREGUNTA_CONSENTIMIENTO_GO } from './kapsoRegistroBase.ts';

export async function cerrarAuditoriaGo(base44, auditoria, resultado) {
  const turno = auditoria.turno;
  const timestamp = new Date().toISOString();
  const wamidSalida = `wamid.TEST.OUT.${(await hashGo(turno.clave)).slice(0, 32)}`;
  const siguiente = resultado.seguimiento?.estado || turno.estado_anterior || 'inicio';
  if (resultado.respuesta.includes(PREGUNTA_CONSENTIMIENTO_GO)) await auditoria.registrar('consentimiento', {
    decision: 'solicitado', pregunta_literal: PREGUNTA_CONSENTIMIENTO_GO, agent_message_id: resultado.agent_message_id || '' }, 'consentimiento_solicitado');
  await auditoria.registrar('transicion', { desde: turno.estado_anterior, hacia: siguiente,
    cambio: siguiente !== turno.estado_anterior, origen: resultado.origen || 'orion_asistente', conversation_id: resultado.agent_conversation_id || '' });
  const salidaPersistida = await auditoria.registrar('mensaje_saliente', { wamid: wamidSalida, wamid_entrada: turno.wamid, timestamp_mensaje: timestamp,
    telefono_normalizado: turno.telefono_normalizado, texto: resultado.respuesta, botones: resultado.opciones,
    origen: resultado.origen || 'orion_asistente', enviado: false, simulado: true, conversation_id: resultado.agent_conversation_id || '',
    agent_message_id: resultado.agent_message_id || '' });
  const referencias = { contacto: { entidad: 'ContactoAuditoriaGO', id: auditoria.persona.id },
    turno: { entidad: 'TurnoAuditoriaGO', id: turno.id },
    eventos: (await base44.entities.EventoAuditoriaGO.filter({ turno_id: turno.id }, 'created_date', 100)).map(e => ({ entidad: 'EventoAuditoriaGO', id: e.id, tipo: e.tipo })) };
  const respuesta = { ...resultado, auditoria: referencias, wamid_entrada: turno.wamid, wamid_salida: wamidSalida,
    timestamp_salida: salidaPersistida.datos.timestamp_mensaje, envio_whatsapp: false, simulado: true };
  const primerValor = resultado.socratico?.registros?.find(r => r.tipo === 'FIRST_VALUE');
  if (primerValor) {
    const valor = await base44.entities.ConocimientoObraGO.get(primerValor.id);
    if (valor.turno_id !== turno.id || valor.persona_id !== turno.persona_id) throw new Error('FIRST_VALUE fuera del turno.');
    await base44.entities.ConocimientoObraGO.update(valor.id, { datos: { ...valor.datos,
      salida_simulada_persistida: true, wamid_salida: wamidSalida, evento_salida_id: salidaPersistida.id } });
  }
  await base44.entities.ContactoAuditoriaGO.update(auditoria.persona.id, { estado_onboarding: siguiente, ultimo_wamid: turno.wamid });
  await base44.entities.TurnoAuditoriaGO.update(turno.id, { estado: 'completado', resultado: respuesta,
    estado_siguiente: siguiente, wamid_salida: wamidSalida, agent_message_id: resultado.agent_message_id || '', error: '' });
  return respuesta;
}