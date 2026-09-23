import { firmaOpacaGo } from './kapsoRegistroBase.ts';

export function jsonCanonicoGo(valor) {
  if (Array.isArray(valor)) return `[${valor.map(jsonCanonicoGo).join(',')}]`;
  if (valor && typeof valor === 'object') return `{${Object.keys(valor).filter(k => valor[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${jsonCanonicoGo(valor[k])}`).join(',')}}`;
  return JSON.stringify(valor);
}
export async function unoAuditoriaGo(db, filtro) {
  const rows = await db.filter(filtro, 'created_date', 2);
  if (rows.length > 1) throw new Error('Conflicto de idempotencia: claves duplicadas; procesamiento detenido.');
  return rows[0] || null;
}
export async function firmarEventoGo(datos) { return firmaOpacaGo(`auditoria:${jsonCanonicoGo(datos)}`); }
export function camposEventoGo(row) {
  return Object.fromEntries(['clave','entorno','grupo_prueba','sesion_id','persona_id','turno_id','wamid','telefono_normalizado','timestamp_evento','tipo','datos','simulado'].map(k => [k, row[k]]));
}
export async function registrarEventoGo(base44, turno, tipo, datos, paso = tipo) {
  const db = base44.entities.EventoAuditoriaGO;
  const clave = `${turno.clave}:${paso}`;
  const previo = await unoAuditoriaGo(db, { clave });
  if (previo) {
    if (previo.firma_integridad !== await firmarEventoGo(camposEventoGo(previo))) throw new Error('Integridad de auditoría inválida.');
    return previo;
  }
  const registro = { clave, entorno: 'dev', grupo_prueba: turno.grupo_prueba, sesion_id: turno.sesion_id,
    persona_id: turno.persona_id, turno_id: turno.id, wamid: turno.wamid,
    telefono_normalizado: turno.telefono_normalizado, timestamp_evento: new Date().toISOString(), tipo, datos, simulado: true };
  return db.create({ ...registro, firma_integridad: await firmarEventoGo(registro) });
}
// Serialización local complementaria. No equivale a una transacción entre workers distintos.
const colas = new Map();
export async function serializarAuditoriaGo(clave, tarea) {
  const previa = colas.get(clave) || Promise.resolve();
  let liberar;
  const espera = new Promise(resolve => { liberar = resolve; });
  const actual = previa.then(() => espera);
  colas.set(clave, actual);
  await previa;
  try { return await tarea(); }
  finally { liberar(); if (colas.get(clave) === actual) colas.delete(clave); }
}