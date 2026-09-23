import { firmaOpacaGo } from './kapsoRegistroBase.ts';

const db = base44 => base44.asServiceRole.entities.VinculoCanalGO;

export async function vinculoDelUsuario(base44, usuarioId) {
  const found = await db(base44).filter({ usuario_id: usuarioId, estado: 'activo' }, '-created_date', 2);
  if (found.length > 1) throw new Error('Hay más de un vínculo activo para esta cuenta.');
  return found[0] || null;
}

export async function vinculoDelContacto(base44, mensaje) {
  const contactoClave = await firmaOpacaGo(`contacto:prod:prod:${mensaje.phone_number_id}:${mensaje.remite_numero}`);
  const found = await db(base44).filter({ contacto_clave: contactoClave, estado: 'activo' }, '-created_date', 2);
  if (found.length > 1) throw new Error('Contacto vinculado a más de una cuenta.');
  return found[0] || null;
}

export async function emitirCodigoGo(base44, usuarioId, nombre) {
  if (await vinculoDelUsuario(base44, usuarioId)) return { vinculado: true };
  const anteriores = await db(base44).filter({ usuario_id: usuarioId, estado: 'pendiente' }, '-created_date', 30);
  for (const item of anteriores) await db(base44).update(item.id, { estado: 'revocado', codigo_hash: '' });
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const codigo = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const expiraEn = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await db(base44).create({ usuario_id: usuarioId, nombre: nombre || '', estado: 'pendiente', codigo_hash: await firmaOpacaGo(`vinculo:${codigo}`), expira_en: expiraEn });
  return { vinculado: false, codigo, expira_en: expiraEn };
}

export async function confirmarCodigoGo(base44, mensaje, codigo) {
  if (!/^[A-F0-9]{16}$/.test(codigo)) return 'Código inválido. Genera uno nuevo desde tu cuenta de GO.';
  const hash = await firmaOpacaGo(`vinculo:${codigo}`);
  const encontrados = await db(base44).filter({ codigo_hash: hash, estado: 'pendiente' }, '-created_date', 2);
  if (encontrados.length !== 1 || new Date(encontrados[0].expira_en).getTime() < Date.now())
    return 'Código vencido o ya utilizado. Genera uno nuevo desde tu cuenta de GO.';
  const pendiente = encontrados[0];
  const contactoClave = await firmaOpacaGo(`contacto:prod:prod:${mensaje.phone_number_id}:${mensaje.remite_numero}`);
  const ocupados = await db(base44).filter({ contacto_clave: contactoClave, estado: 'activo' }, '-created_date', 2);
  if (ocupados.length) return 'Este WhatsApp ya está vinculado. Desvincúlalo desde la cuenta anterior antes de continuar.';
  if (await vinculoDelUsuario(base44, pendiente.usuario_id)) return 'Esta cuenta ya está vinculada. Desvincúlala desde la app antes de continuar.';
  await db(base44).update(pendiente.id, { estado: 'activo', codigo_hash: '', telefono: mensaje.remite_numero,
    phone_number_id: mensaje.phone_number_id, contacto_clave: contactoClave, vinculado_en: new Date().toISOString() });
  return 'WhatsApp vinculado a tu cuenta de GO. Tu historial se puede consultar desde la app. Esto no autoriza acceso a registros privados por WhatsApp.';
}

export async function revocarVinculoGo(base44, usuarioId) {
  const actual = await vinculoDelUsuario(base44, usuarioId);
  if (actual) await db(base44).update(actual.id, { estado: 'revocado', telefono: '', contacto_clave: '', phone_number_id: '' });
  const pendientes = await db(base44).filter({ usuario_id: usuarioId, estado: 'pendiente' }, '-created_date', 30);
  for (const item of pendientes) await db(base44).update(item.id, { estado: 'revocado', codigo_hash: '' });
}