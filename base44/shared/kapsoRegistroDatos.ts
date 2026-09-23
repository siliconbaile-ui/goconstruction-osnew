import { CAMPOS_DECLARADOS_GO, entradaHistorialGo, sobreHistorialGo } from './kapsoRegistroBase.ts';

// Las propuestas del agente solo se guardan si citan literalmente el mensaje de la persona.
export function declaracionesValidasGo(propuesta, texto, messageId) {
  const datos = {}, fuentes = {};
  for (const campo of CAMPOS_DECLARADOS_GO) {
    const item = propuesta?.[campo];
    if (!item || typeof item.valor !== 'string' || typeof item.evidencia !== 'string') continue;
    const valor = item.valor.trim(), evidencia = item.evidencia.trim();
    if (!valor || valor.length > 160 || /[\r\n]/.test(valor) || !evidencia || !texto.includes(evidencia) || !evidencia.includes(valor)) continue;
    datos[campo] = valor;
    fuentes[campo] = { message_id: messageId, tipo: 'declaracion_literal', fecha: new Date().toISOString() };
  }
  return { datos, fuentes };
}
export function contextoAnteriorRegistroGo(conversacion) {
  let entrada = null, pregunta = null;
  const datos = {}, fuentes = {};
  for (const mensaje of conversacion.messages || []) {
    const original = entradaHistorialGo(mensaje);
    if (original) {
      const wamid = /\[kapso_message_id:([^\]]+)\]/.exec(mensaje.content)?.[1] || mensaje.id;
      entrada = { ...original, id: wamid }; pregunta = null;
      if (original.registro_tecnico?.consentimiento === 'retirado') {
        for (const campo of CAMPOS_DECLARADOS_GO) { delete datos[campo]; delete fuentes[campo]; }
      }
      continue;
    }
    const sobre = sobreHistorialGo(mensaje);
    if (!entrada || !sobre) continue;
    const extraidos = declaracionesValidasGo(sobre.registro?.declaraciones, entrada.texto || '', entrada.id);
    Object.assign(datos, extraidos.datos); Object.assign(fuentes, extraidos.fuentes);
    pregunta = { id: mensaje.id, cuerpo: sobre.cuerpo, solicitud: sobre.registro?.solicitud };
  }
  return { datos, fuentes, pregunta, tecnico: entrada?.registro_tecnico || {} };
}
export function vistaPerfilDeclaradoGo(perfil) {
  if (!perfil || perfil.consentimiento !== 'aceptado') return null;
  return { ...Object.fromEntries(CAMPOS_DECLARADOS_GO.map(c => [c, perfil[c] || ''])),
    tipo: 'contexto_declarado', identidad_verificada: false, permisos: [], consentimiento: perfil.consentimiento };
}
export async function retirarPerfilGo(db, perfil, messageId) {
  if (!perfil) return null;
  return db.update(perfil.id, { ...Object.fromEntries(CAMPOS_DECLARADOS_GO.map(c => [c, ''])),
    estado: 'retirado', consentimiento: 'retirado', consentimiento_fecha: new Date().toISOString(),
    consentimiento_message_id: messageId, procedencia_campos: {}, invitador_id: '', raiz_linaje_id: '',
    invitacion_origen_hash: '', pase_hash: '', pase_nonce: '', pase_nombre_publico: '', pase_expira: '' });
}