import { SALUDO_PASE_GO, CONSENTIMIENTO_GO_VERSION, PREGUNTA_CONSENTIMIENTO_GO, UUID_GO,
  CAMPOS_DECLARADOS_GO, confirmarGo, negarGo, normalizarRespuestaGo, firmaOpacaGo, entradaHistorialGo } from './kapsoRegistroBase.ts';
import { contextoAnteriorRegistroGo, declaracionesValidasGo, retirarPerfilGo, vistaPerfilDeclaradoGo } from './kapsoRegistroDatos.ts';
import { resolverPaseGo, revalidarPaseGo, emitirPaseGo } from './kapsoPaseGo.ts';
import { narrativaRegistroGo } from './kapsoRegistroNarrativa.ts';

// Solo la ruta administrativa fuerza dev y habilita esta ampliación; el webhook publicado no la activa.
export async function prepararRegistroGo(base44, registro, conversacion, entrada, grupoPrueba, auditoria = null) {
  if (!UUID_GO.test(grupoPrueba)) throw new Error('Grupo de desarrollo inválido.');
  const db = base44.entities.PerfilOnboardingGO;
  const contactoClave = await firmaOpacaGo(`contacto:dev:${grupoPrueba}:${registro.phone_number_id}:${registro.remite_numero}`);
  const filtro = { contacto_clave: contactoClave, entorno: 'dev', grupo_prueba: grupoPrueba };
  const encontrados = await db.filter(filtro, '-created_date', 2);
  if (encontrados.length > 1) throw new Error('El contacto tiene perfiles duplicados; no se seleccionó uno arbitrariamente.');
  let perfil = encontrados[0] || null;
  const anterior = contextoAnteriorRegistroGo(conversacion);
  if (auditoria?.anterior?.preparacion?.tecnico) anterior.tecnico = auditoria.anterior.preparacion.tecnico;
  const texto = entrada.texto || '';
  // Ningún botón, audio ni inferencia del modelo concede consentimiento.
  const respuestaDirecta = registro.tipo_mensaje === 'texto' && !registro.opcion_elegida;
  const si = respuestaDirecta && confirmarGo(texto), no = respuestaDirecta && negarGo(texto);
  const retiro = respuestaDirecta && ['olvida mi perfil', 'retira mi consentimiento', 'no guardes mis datos'].includes(normalizarRespuestaGo(texto));
  let confirmacion = '', enlace = '';
  if (retiro) { perfil = await retirarPerfilGo(db, perfil, registro.message_id); confirmacion = 'Perfil retirado; pase invalidado. Los mensajes del chat no se eliminaron.'; }
  const recibida = await resolverPaseGo(db, texto, grupoPrueba, contactoClave, registro.message_id);
  if (recibida) await auditoria?.registrar('invitacion_usada', { ...recibida,
    perfil_aun_no_consentido: !perfil, otorgante: 'GO' });
  let referencia = !perfil ? await revalidarPaseGo(db, anterior.tecnico.referencia, grupoPrueba, contactoClave) : null;
  if (!perfil && !referencia && recibida?.estado === 'valido') referencia = recibida;
  let consentimiento = perfil?.consentimiento || anterior.tecnico.consentimiento || 'pendiente';
  if (retiro) consentimiento = 'retirado';
  const preguntoPermiso = anterior.pregunta?.cuerpo?.includes(PREGUNTA_CONSENTIMIENTO_GO);
  if (preguntoPermiso && no && consentimiento !== 'aceptado') consentimiento = 'rechazado';
  if (!retiro && preguntoPermiso && si && consentimiento !== 'retirado' && !perfil) {
    perfil = await db.create({ ...filtro, estado: 'declarado', consentimiento: 'aceptado',
      consentimiento_version: CONSENTIMIENTO_GO_VERSION, consentimiento_fecha: new Date().toISOString(),
      consentimiento_message_id: registro.message_id, consentimiento_pregunta_id: anterior.pregunta.id,
      ...anterior.datos, procedencia_campos: anterior.fuentes,
      procedencia: referencia ? 'pase' : 'directo', invitador_id: referencia?.invitador_id || '',
      raiz_linaje_id: referencia?.raiz_linaje_id || '', invitacion_origen_hash: referencia?.hash || '',
      entrada_message_id: referencia?.entrada_message_id || registro.message_id });
    if (!perfil.raiz_linaje_id) perfil = await db.update(perfil.id, { raiz_linaje_id: perfil.id });
    consentimiento = 'aceptado'; confirmacion = 'Contexto declarado guardado con consentimiento; no verifica identidad ni permisos.';
  }
  if (retiro || (preguntoPermiso && (si || no))) await auditoria?.registrar('consentimiento', {
    decision: consentimiento, version: CONSENTIMIENTO_GO_VERSION, pregunta_id: anterior.pregunta?.id || '',
    pregunta_literal: anterior.pregunta?.cuerpo || '', respuesta_literal: texto, perfil_id: perfil?.id || '' });
  const pedido = respuestaDirecta && ((/\b(enlace|link|pase)\b/i.test(texto) && /gener|crea|dame|compart|invit/i.test(texto)) || /quiero invitar/i.test(texto));
  const continuacionPedido = anterior.tecnico.solicitud_pase && (si || no) && preguntoPermiso;
  const solicitarPase = !retiro && (pedido || continuacionPedido) && !['rechazado', 'retirado'].includes(consentimiento);
  if (solicitarPase && perfil?.consentimiento === 'aceptado') {
    const emitido = await emitirPaseGo(db, perfil, registro.message_id);
    perfil = emitido.perfil; enlace = emitido.url;
    await auditoria?.registrar('invitacion_emitida', { perfil_id: perfil.id, pase_hash: perfil.pase_hash,
      invitador_id: perfil.id, raiz_linaje_id: perfil.raiz_linaje_id || perfil.id, expira: perfil.pase_expira, otorgante: 'GO' });
  }
  const tecnico = { consentimiento, referencia, solicitud_pase: solicitarPase && !enlace, confirmacion, enlace_emitido: enlace };
  const contexto = { persona_conocida_en_este_hilo: (conversacion.messages || []).some(m => m.role === 'user' && typeof m.content === 'string' && m.content.includes('[kapso_message_id:')),
    perfil: vistaPerfilDeclaradoGo(perfil), consentimiento, confirmacion,
    nueva_invitacion: recibida?.estado === 'valido', invitacion_invalida: recibida?.estado === 'invalido',
    saludo_pase: recibida?.estado === 'valido' ? SALUDO_PASE_GO : '',
    solicitud_pase: solicitarPase, enlace_emitido: enlace, identidad_verificada: false, acceso_privado: false, entorno: 'dev' };
  const estado = { db, perfil, tecnico, contexto, texto, auditoria, instrucciones: narrativaRegistroGo(contexto) };
  await auditoria?.guardarPreparacion(estado);
  return estado;
}

export async function recuperarRegistroGo(base44, registro, mensaje, grupoPrueba, auditoria = null) {
  const entrada = entradaHistorialGo(mensaje);
  const guardado = auditoria?.turno?.preparacion;
  const tecnico = guardado?.tecnico || entrada?.registro_tecnico;
  const contexto = guardado?.contexto || entrada?.registro_contexto;
  if (!tecnico || !contexto) throw new Error('El turno no pertenece al registro conversacional.');
  const db = base44.entities.PerfilOnboardingGO;
  const clave = await firmaOpacaGo(`contacto:dev:${grupoPrueba}:${registro.phone_number_id}:${registro.remite_numero}`);
  const perfiles = await db.filter({ contacto_clave: clave, entorno: 'dev', grupo_prueba: grupoPrueba }, '-created_date', 2);
  if (perfiles.length > 1) throw new Error('Contacto duplicado.');
  return { db, perfil: perfiles[0] || null, tecnico, contexto, texto: guardado?.texto || entrada.texto, auditoria };
}

export async function finalizarRegistroGo(estado, salida, registro, herramientas) {
  if (!estado) return null;
  if (herramientas.length) throw new Error('Respuesta retenida: contexto declarado no permite herramientas de datos; no se envió al contacto.');
  if (salida.cuerpo.length > 360 || salida.cuerpo.split('\n').length > 3 || (salida.cuerpo.match(/\?/g) || []).length > 1 || salida.opciones.length > 3)
    throw new Error('La respuesta no cumple el formato conversacional breve.');
  if (estado.contexto.saludo_pase && !salida.cuerpo.includes(SALUDO_PASE_GO)) throw new Error('GO no usó el copy exacto del Pase de Obra de GO.');
  if (/Pase de Obra de (?!GO\b)/i.test(salida.cuerpo)) throw new Error('El copy no puede atribuir el pase a una persona.');
  const referenciaInvitador = estado.tecnico.referencia?.invitador_id || estado.perfil?.invitador_id;
  if (referenciaInvitador) {
    const invitador = await estado.db.get(referenciaInvitador);
    const nombre = invitador?.nombre?.trim();
    if (nombre && salida.cuerpo.toLocaleLowerCase('es').includes(nombre.toLocaleLowerCase('es')))
      throw new Error('La respuesta menciona al invitador; se retuvo sin enviar.');
  }
  if (estado.contexto.enlace_emitido && !salida.cuerpo.includes(estado.contexto.enlace_emitido)) throw new Error('GO no entregó el enlace generado.');
  if (/https:\/\/wa\.me\//i.test(salida.cuerpo) && !estado.contexto.enlace_emitido) throw new Error('GO no puede inventar enlaces de invitación.');
  let perfil = estado.perfil;
  if (perfil?.consentimiento === 'aceptado') {
    const cambios = declaracionesValidasGo(salida.registro?.declaraciones, estado.texto, registro.message_id);
    const datos = Object.fromEntries(Object.entries(cambios.datos).filter(([campo, valor]) => perfil[campo] !== valor));
    if (Object.keys(datos).length) perfil = await estado.db.update(perfil.id, {
      ...datos, procedencia_campos: { ...perfil.procedencia_campos,
        ...Object.fromEntries(Object.keys(datos).map(campo => [campo, cambios.fuentes[campo]])) } });
  }
  if (perfil) await estado.auditoria?.registrar('perfil_actualizado', { perfil_id: perfil.id, contexto: vistaPerfilDeclaradoGo(perfil),
    procedencia_campos: perfil.procedencia_campos || {} }, 'perfil_final');
  return { perfil_id: perfil?.id || null, estado: estado.tecnico.consentimiento,
    campos_guardados: perfil?.consentimiento === 'aceptado' ? CAMPOS_DECLARADOS_GO.filter(c => perfil[c]) : [],
    procedencia: perfil?.procedencia || (estado.tecnico.referencia ? 'pase_pendiente_consentimiento' : 'directo'),
    identidad_verificada: false, acceso_privado: false, enlace_emitido: estado.contexto.enlace_emitido || null };
}