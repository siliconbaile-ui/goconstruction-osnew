import { firmaOpacaGo, hashGo } from './kapsoRegistroBase.ts';

export async function resolverPaseGo(db, texto, grupoPrueba, contactoClave, messageId, entorno = 'dev') {
  const coincidencia = /\bGO PASE ([A-Za-z0-9_-]{43})\b/.exec(texto);
  if (!coincidencia) return /\bGO PASE\b/i.test(texto) ? { estado: 'invalido' } : null;
  const paseHash = await hashGo(coincidencia[1]);
  const candidatos = await db.filter({ entorno, grupo_prueba: grupoPrueba, pase_hash: paseHash, consentimiento: 'aceptado', estado: 'declarado' }, '-created_date', 2);
  if (candidatos.length !== 1) return { estado: 'invalido' };
  const invitador = candidatos[0];
  if (invitador.contacto_clave === contactoClave || !invitador.pase_expira || Date.parse(invitador.pase_expira) <= Date.now()) return { estado: 'invalido' };
  return { estado: 'valido', invitador_id: invitador.id, raiz_linaje_id: invitador.raiz_linaje_id || invitador.id,
    hash: paseHash, entrada_message_id: messageId };
}
export async function revalidarPaseGo(db, referencia, grupoPrueba, contactoClave, entorno = 'dev') {
  if (!referencia?.invitador_id || !referencia.hash) return null;
  const encontrados = await db.filter({ id: referencia.invitador_id, entorno, grupo_prueba: grupoPrueba,
    pase_hash: referencia.hash, consentimiento: 'aceptado', estado: 'declarado' }, '-created_date', 1);
  const invitador = encontrados[0];
  if (!invitador || invitador.contacto_clave === contactoClave || Date.parse(invitador.pase_expira || '') <= Date.now() || !invitador.pase_expira) return null;
  return { estado: 'valido', invitador_id: invitador.id, raiz_linaje_id: invitador.raiz_linaje_id || invitador.id,
    hash: referencia.hash, entrada_message_id: referencia.entrada_message_id };
}
export async function emitirPaseGo(db, perfil, messageId, entorno = 'dev') {
  if (perfil.consentimiento !== 'aceptado' || perfil.estado !== 'declarado') throw new Error('Falta consentimiento para crear el pase.');
  const activo = perfil.pase_nonce && perfil.pase_hash && Date.parse(perfil.pase_expira || '') > Date.now()
    && perfil.pase_nombre_publico === 'GO';
  const nonce = activo ? perfil.pase_nonce : crypto.randomUUID();
  const token = await firmaOpacaGo(`pase:${entorno}:${perfil.grupo_prueba}:${perfil.id}:${nonce}`);
  const cambio = { pase_nonce: nonce, pase_hash: await hashGo(token),
    pase_expira: activo ? perfil.pase_expira : new Date(Date.now() + 30 * 86400000).toISOString(),
    pase_nombre_publico: 'GO',
    pase_consentimiento_message_id: activo ? perfil.pase_consentimiento_message_id : messageId,
    pase_ultimo_message_id: messageId };
  const actualizado = await db.update(perfil.id, cambio);
  return { perfil: actualizado, url: `https://wa.me/12084455689?text=${encodeURIComponent(`GO PASE ${token}`)}` };
}