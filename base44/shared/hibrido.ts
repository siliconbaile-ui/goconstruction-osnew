// Búsqueda híbrida y citación precisa para el cerebro técnico de GO.
// El vector solo entiende "sentido"; una consulta normativa chilena depende de
// coincidencias LITERALES ("NCh 170", "OGUC 4.1.10", "art. 5.8.3"). Aquí se
// combinan ambas señales y se resuelve la página exacta del tramo.

const VACIAS = new Set(['para', 'como', 'cual', 'cuales', 'sobre', 'entre', 'debe', 'este', 'esta', 'esto', 'segun', 'donde', 'cuanto', 'cuanta', 'tiene', 'hay', 'del', 'las', 'los', 'una', 'uno', 'por', 'con', 'que', 'the']);

function normalizar(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Códigos normativos y de articulado, la señal más discriminante de una consulta técnica.
export function codigosNormativos(texto) {
  const t = normalizar(texto);
  const codigos = new Set();
  const patrones = [
    /\bnch\s*\.?\s*(\d{2,4})(?:\s*[-.]?\s*(\d{2,4}))?/g,       // NCh 170, NCh 433-2009
    /\b(oguc|lguc|dfl|ds|dto|decreto)\s*\.?\s*n?°?\s*(\d{1,4})?/g,
    /\b(?:art(?:iculo)?\.?|tabla|figura|lamina|anexo)\s*n?°?\s*([\d.]+)/g,
    /\b\d+\.\d+\.\d+(?:\.\d+)?\b/g,                             // 4.1.10 / 5.8.3.1
    /\b(?:ley)\s*n?°?\s*([\d.]{4,7})/g,
    /\b(aci|astm|iso|nfpa)\s*\.?\s*([\dA-Za-z-]{2,8})/g,
    /\bf'?c\s*\d+\b/g,
    /\b[gh]\s?\d{2}\b/g,                                        // H30, G25
  ];
  for (const p of patrones) {
    for (const m of t.matchAll(p)) codigos.add(m[0].replace(/[\s.°]+/g, ' ').trim());
  }
  return [...codigos];
}

function tokens(texto) {
  return normalizar(texto).match(/[a-z0-9'.]{3,}/g)?.filter(w => !VACIAS.has(w)) || [];
}

// 0..1 — cobertura léxica del tramo respecto de la pregunta, con peso fuerte
// en los códigos normativos y en los números (cotas, resistencias, diámetros).
export function puntajeLexico(pregunta, texto) {
  const t = normalizar(texto);
  const pedidos = tokens(pregunta);
  if (pedidos.length === 0) return 0;
  const unicos = [...new Set(pedidos)];
  let peso = 0;
  let logrado = 0;
  for (const w of unicos) {
    const p = /\d/.test(w) ? 3 : 1;
    peso += p;
    if (t.includes(w)) logrado += p;
  }
  const codigos = codigosNormativos(pregunta);
  for (const c of codigos) {
    peso += 6;
    const suelto = c.replace(/\s+/g, '\\s*\\.?\\s*');
    if (new RegExp(suelto).test(t)) logrado += 6;
  }
  return peso === 0 ? 0 : logrado / peso;
}

// Marcador de página dentro del propio texto del tramo (PDF paginado).
export function paginaDeTexto(texto) {
  const t = normalizar(texto);
  const m = t.match(/(?:p[aá]g(?:ina)?s?\.?|\bp\.\s*)\s*(\d{1,4})\b/) || t.match(/^\s*[-—]\s*(\d{1,4})\s*[-—]\s*$/m);
  const n = m ? parseInt(m[1], 10) : 0;
  return n > 0 && n < 5000 ? n : 0;
}

// Página por tramo: usa los marcadores reales cuando existen (arrastrando el
// último visto) y solo estima proporcionalmente cuando el PDF no los trae.
export function paginasPorTramo(tramos, paginasTotales = 0) {
  let ultima = 0;
  return tramos.map((t, i) => {
    const detectada = paginaDeTexto(t);
    if (detectada) ultima = detectada;
    if (ultima) return { pagina: ultima, exacta: true };
    const estimada = paginasTotales ? Math.max(1, Math.round(((i + 1) / tramos.length) * paginasTotales)) : 0;
    return { pagina: estimada, exacta: false };
  });
}

// Fusión híbrida por Reciprocal Rank Fusion: combina el ranking denso (Pinecone)
// con el ranking léxico, sin que ninguna señal domine por escala.
export function fusionHibrida(candidatos, pregunta, topK = 6, pesoLexico = 1.15) {
  const conLexico = candidatos.map(c => ({ ...c, lexico: puntajeLexico(pregunta, c.texto || '') }));
  const rankDenso = [...conLexico].sort((a, b) => (b.score || 0) - (a.score || 0));
  const rankLexico = [...conLexico].sort((a, b) => b.lexico - a.lexico);
  const posicion = (lista, item) => lista.indexOf(item) + 1;

  return conLexico
    .map(c => ({
      ...c,
      score_hibrido: 1 / (60 + posicion(rankDenso, c)) + pesoLexico / (60 + posicion(rankLexico, c)),
    }))
    .sort((a, b) => b.score_hibrido - a.score_hibrido)
    .slice(0, topK);
}