// Recuperación híbrida compartida: única puerta de entrada al cerebro técnico
// de GO. Toda cita normativa (NCh, OGUC, EETT, planos) nace de acá, con la
// página verificada del tramo, para que ninguna respuesta invente paginación.
import { embeddings, consultarVectores } from './conocimiento.ts';
import { fusionHibrida, paginaDeTexto, codigosNormativos } from './hibrido.ts';

export function normalizarTexto(t) {
  return (t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Página del tramo: marcador real del PDF > página exacta guardada al indexar >
// estimación. `pagina_exacta` distingue lo citable de lo aproximado.
export function formatearTramo(t) {
  const enTexto = paginaDeTexto(t.texto || '');
  const pagina = enTexto || (t.pagina_exacta ? t.pagina : 0) || t.pagina || t.pagina_aprox || 0;
  const exacta = !!(enTexto || t.pagina_exacta);
  return {
    documento: t.titulo,
    documento_id: t.documento_id,
    especialidad: t.especialidad,
    pagina,
    pagina_exacta: exacta,
    cita: pagina
      ? `${t.titulo}, p. ${pagina}${exacta ? '' : ' (aprox.)'}`
      : `${t.titulo} (sin paginación en el archivo)`,
    relevancia_semantica: Number((t.score || 0).toFixed(3)),
    coincidencia_literal: Number((t.lexico || 0).toFixed(3)),
    texto: t.texto,
  };
}

export async function recuperarTramos(pregunta, opciones = {}) {
  const { proyecto_id = null, especialidad = null, topK = 6 } = opciones;
  const [vector] = await embeddings([pregunta], 'query');
  const filtro = especialidad ? { especialidad: { $eq: especialidad } } : null;
  const recall = Math.max(30, topK * 6);

  let candidatos = await consultarVectores(vector, { topK: recall, namespace: proyecto_id || 'obra', filtro });
  if (proyecto_id && candidatos.length < recall / 2) {
    const generales = await consultarVectores(vector, { topK: recall, namespace: 'obra', filtro });
    candidatos = [...candidatos, ...generales];
  }

  return fusionHibrida(candidatos, pregunta, topK).map(formatearTramo);
}

// Una cita solo vale si el fragmento aparece LITERALMENTE en el tramo citado.
// Así se descarta cualquier página o texto inventado por el modelo.
export function verificarCita(cita, tramos) {
  const fragmento = normalizarTexto(cita?.fragmento);
  if (fragmento.length < 12) return null;
  const tramo = tramos.find(t => normalizarTexto(t.texto).includes(fragmento));
  if (!tramo) return null;
  return {
    documento: tramo.documento,
    documento_id: tramo.documento_id,
    pagina: tramo.pagina,
    pagina_exacta: tramo.pagina_exacta,
    cita: tramo.cita,
    fragmento: cita.fragmento,
  };
}

export { codigosNormativos };