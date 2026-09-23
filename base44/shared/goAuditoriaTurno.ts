import { firmaOpacaGo, hashGo } from './kapsoRegistroBase.ts';
import { unoAuditoriaGo, jsonCanonicoGo, registrarEventoGo } from './goAuditoriaStore.ts';

export async function iniciarAuditoriaGo(base44, mensaje, grupo, sesion) {
  const telefono = `+${mensaje.remite_numero.replace(/\D/g, '')}`;
  if (!/^\+[1-9]\d{6,14}$/.test(telefono)) throw new Error('Teléfono inválido para auditoría.');
  const contactoClave = await firmaOpacaGo(`contacto:dev:${grupo}:${mensaje.phone_number_id}:${mensaje.remite_numero}`);
  const personas = base44.entities.ContactoAuditoriaGO, turnos = base44.entities.TurnoAuditoriaGO;
  const filtro = { contacto_clave: contactoClave, entorno: 'dev', grupo_prueba: grupo };
  let persona = await unoAuditoriaGo(personas, filtro);
  if (!persona) persona = await personas.create({ ...filtro, telefono_normalizado: telefono, phone_number_id: mensaje.phone_number_id,
    primer_wamid: mensaje.message_id, primera_entrada: mensaje.timestamp_inbound,
    procedencia: /\bGO PASE\b/i.test(mensaje.contenido_texto) ? 'pase_presentado' : 'directo', estado_onboarding: 'sin_iniciar' });
  const clave = await hashGo(`dev:${grupo}:${mensaje.phone_number_id}:${mensaje.message_id}`);
  const entrada = { texto: mensaje.contenido_texto, tipo: mensaje.tipo_mensaje, archivo_url: mensaje.archivo_url,
    archivo_mime: mensaje.archivo_mime, transcripcion: mensaje.transcripcion, coordenadas_gps: mensaje.coordenadas_gps,
    seleccion: mensaje.opcion_elegida || null, remitente: telefono, sesion_id: sesion,
    ...(mensaje.etapa2 ? { etapa: 2, aplicar_regla_id: mensaje.aplicar_regla_id || '' } : {}) };
  const huella = await hashGo(jsonCanonicoGo(entrada));
  let turno = await unoAuditoriaGo(turnos, { clave });
  const previos = await turnos.filter({ persona_id: persona.id, sesion_id: sesion, entorno: 'dev', grupo_prueba: grupo, estado: 'completado' }, '-created_date', 2);
  const anterior = previos.find(t => t.wamid !== mensaje.message_id) || null;
  if (!turno) turno = await turnos.create({ clave, entorno: 'dev', grupo_prueba: grupo, sesion_id: sesion, persona_id: persona.id,
    telefono_normalizado: telefono, phone_number_id: mensaje.phone_number_id, wamid: mensaje.message_id,
    timestamp_mensaje: mensaje.timestamp_inbound, huella_entrada: huella, entrada, estado: 'recibido',
    estado_anterior: anterior?.estado_siguiente || 'sin_iniciar', simulado: true });
  const registrar = (tipo, datos, paso) => registrarEventoGo(base44, turno, tipo, datos, paso);
  if (turno.huella_entrada !== huella) {
    await registrar('conflicto', { motivo: 'Mismo wamid con otra entrada', huella_recibida: huella }, `conflicto:${huella}`);
    throw new Error('Wamid reutilizado con distinto contenido, contacto o sesión.');
  }
  await registrar('ingreso', { persona_id: persona.id, procedencia: persona.procedencia, timestamp_mensaje: turno.timestamp_mensaje });
  await registrar('mensaje_entrante', { ...turno.entrada, wamid: turno.wamid, timestamp_mensaje: turno.timestamp_mensaje });
  if (mensaje.opcion_elegida) await registrar('boton_elegido', { recibido: mensaje.opcion_elegida, validado: false }, 'boton_recibido');
  if (turno.estado === 'completado') {
    await registrar('reintento', { resultado: 'respuesta_persistida_reutilizada', envio_real: false });
    return { duplicado: true, resultado: turno.resultado, turno, persona, registrar };
  }
  if (turno.estado === 'error' && previos.some(t => Date.parse(t.created_date) > Date.parse(turno.created_date))) {
    await registrar('conflicto', { motivo: 'Turno fallido anterior a otros ya completados; no revertir el estado' }, 'conflicto:turno_antiguo');
    throw new Error('No se reanudó un turno antiguo después de otros completados.');
  }
  if (turno.estado === 'procesando') {
    await registrar('reintento', { resultado: 'en_proceso_no_reinvocar', envio_real: false });
    throw new Error('El wamid sigue en proceso; no se inició una segunda ejecución.');
  }
  turno = await turnos.update(turno.id, { estado: 'procesando', error: '' });
  const auditoria = { turno, persona, anterior, registrar,
    guardarPreparacion: async estado => {
      const preparacion = { tecnico: estado.tecnico, contexto: estado.contexto, texto: estado.texto };
      turno = await turnos.update(turno.id, { preparacion }); auditoria.turno = turno;
      if (estado.perfil) {
        await personas.update(persona.id, { perfil_id: estado.perfil.id });
        await registrar('perfil_actualizado', { perfil_id: estado.perfil.id, contexto: estado.contexto.perfil }, 'perfil_preparado');
      }
    },
    iniciarAgente: async conversationId => {
      turno = await turnos.update(turno.id, { conversation_id: conversationId }); auditoria.turno = turno;
      await registrar('agente_inicio', { agente: 'orion_asistente', conversation_id: conversationId, estado: 'solicitado' });
    },
    fallar: async error => {
      await registrar('error', { nombre: error.name || 'Error', mensaje: String(error.message || error), conversation_id: turno.conversation_id || '' });
      if (turno.conversation_id) await registrar('agente_fin', { agente: 'orion_asistente', conversation_id: turno.conversation_id, estado: 'error' }, 'agente_error');
      turno = await turnos.update(turno.id, { estado: 'error', error: String(error.message || error) }); auditoria.turno = turno;
    }
  };
  return auditoria;
}