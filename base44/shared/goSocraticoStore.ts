import { unoAuditoriaGo } from './goAuditoriaStore.ts';
export const PERMISO_RELATO_GO = 'Guardaré tu relato y sus reglas para retomarlos; solo los administradores de desarrollo podrán verlos, junto con la auditoría. ¿Autorizas guardarlos?';
export const ESPEJO_GO = ['Así es', 'Corregir', 'No aplica'];
export const APLICABLES_GO = ['confirmada_autor', 'validada_otros'];
export function alcanceSocraticoGo(auditoria) {
  const t = auditoria.turno;
  if (t.entorno !== 'dev' || !t.simulado) throw new Error('Capa socrática disponible solo en desarrollo simulado.');
  return { entorno: 'dev', grupo_prueba: t.grupo_prueba, persona_id: t.persona_id };
}
export async function guardarSocraticoGo(base44, auditoria, tipo, datos, opciones = {}) {
  const t = auditoria.turno, scope = alcanceSocraticoGo(auditoria);
  const clave = opciones.clave || `${t.clave}:socratico:${tipo}:${opciones.paso || 'principal'}`;
  const db = base44.entities.ConocimientoObraGO;
  const previo = await unoAuditoriaGo(db, { ...scope, clave });
  const registro = previo || await db.create({ ...scope, clave, tipo, estado: opciones.estado || 'registrado',
    sesion_id: t.sesion_id, turno_id: t.id, wamid: t.wamid, timestamp_mensaje: t.timestamp_mensaje,
    fuente_literal: opciones.fuente || '', datos, obra_declarada: opciones.obra || '',
    vinculos: [{ entidad: 'TurnoAuditoriaGO', id: t.id, verificado: true }],
    version: opciones.version || 1, anterior_id: opciones.anterior_id || '', regla_id: opciones.regla_id || '',
    validador_persona_id: opciones.validador || '', dia_captura: opciones.dia || '', simulado: true, identidad_verificada: false });
  await auditoria.registrar('transicion', { evento: tipo, entidad: 'ConocimientoObraGO', id: registro.id,
    estado: registro.estado, wamid_origen: registro.wamid }, `socratico:${clave}`);
  return registro;
}
export async function exigirReglaAplicableGo(base44, auditoria, id) {
  const regla = await unoAuditoriaGo(base44.entities.ConocimientoObraGO, { ...alcanceSocraticoGo(auditoria), id, tipo: 'regla_obra' });
  const permisos = await base44.entities.ConocimientoObraGO.filter({ ...alcanceSocraticoGo(auditoria), tipo: 'consentimiento' }, '-created_date', 1);
  if (!regla || !APLICABLES_GO.includes(regla.estado) || permisos[0]?.datos?.decision !== 'aceptado') {
    await auditoria.registrar('acceso_bloqueado', { motivo: 'regla_no_confirmada_o_fuera_de_alcance', regla_id: id,
      estado: regla?.estado || 'no_disponible', utilizada: false }, `regla_bloqueada:${id}`);
    throw new Error('Una regla propuesta, contradicha, retirada o fuera de alcance no puede aplicarse.');
  }
  return regla;
}