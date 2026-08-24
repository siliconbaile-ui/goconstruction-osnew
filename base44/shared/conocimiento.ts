import { secrets } from 'base44:runtime';

/* ─────────────── FIRECRAWL ─────────────── */
// API v2: /scrape (una URL, incluye PDFs), /search (web + scrape), /map (mapa de
// URLs de un sitio), /crawl (rastreo completo asíncrono), formato json con
// prompt/schema para extracción estructurada.
const FIRECRAWL = 'https://api.firecrawl.dev/v2';

async function firecrawl(ruta, body, metodo = 'POST') {
  const key = secrets.get('FIRECRAWL_API_KEY');
  if (!key) throw new Error('Falta FIRECRAWL_API_KEY');
  const res = await fetch(`${FIRECRAWL}${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: metodo === 'GET' ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data?.error || `Firecrawl ${res.status}`);
  }
  return data;
}

export async function scrapeUrl(url, { formatos = ['markdown'], esquema = null, prompt = null, soloPrincipal = true } = {}) {
  const formats = [...formatos];
  if (esquema || prompt) {
    formats.push({ type: 'json', ...(esquema ? { schema: esquema } : {}), ...(prompt ? { prompt } : {}) });
  }
  const { data } = await firecrawl('/scrape', {
    url,
    formats,
    onlyMainContent: soloPrincipal,
    parsers: ['pdf'],
    maxAge: 172800000,
  });
  return data || {};
}

export async function buscarWeb(query, { limite = 5, scrape = true, pais = 'cl', idioma = 'es' } = {}) {
  const body = {
    query,
    limit: limite,
    location: pais,
    sources: [{ type: 'web' }],
  };
  if (scrape) body.scrapeOptions = { formats: ['markdown'], onlyMainContent: true };
  const { data } = await firecrawl('/search', body);
  return (data?.web || []).map(r => ({
    url: r.url,
    titulo: r.title,
    descripcion: r.description,
    contenido: (r.markdown || '').slice(0, 12000),
  }));
}

export async function mapearSitio(url, { busqueda = null, limite = 100 } = {}) {
  const data = await firecrawl('/map', { url, ...(busqueda ? { search: busqueda } : {}), limit: limite });
  return (data?.links || data?.data?.links || []).slice(0, limite);
}

/* ─────────────── PINECONE ─────────────── */
const PINECONE_API = 'https://api.pinecone.io';
const MODELO_EMBED = 'multilingual-e5-large'; // 1024 dims, fuerte en español técnico

function pineconeKey() {
  const key = secrets.get('PINECONE_API_KEY');
  if (!key) throw new Error('Falta PINECONE_API_KEY');
  return key;
}

export async function hostIndice() {
  const explicito = secrets.get('PINECONE_INDEX_HOST');
  if (explicito) return explicito.replace(/^https?:\/\//, '');
  const res = await fetch(`${PINECONE_API}/indexes`, {
    headers: { 'Api-Key': pineconeKey(), 'X-Pinecone-Api-Version': '2025-04' },
  });
  const data = await res.json();
  const indices = data?.indexes || [];
  const compatible = indices.find(i => i.dimension === 1024);
  if (compatible?.host) return compatible.host;
  return await crearIndice();
}

// El modelo multilingual-e5-large entrega 1024 dimensiones: si el proyecto no
// tiene un índice compatible, GO lo crea solo y usa el host de la respuesta.
const INDICE = 'goconstruction-conocimiento';

async function crearIndice() {
  const res = await fetch(`${PINECONE_API}/indexes`, {
    method: 'POST',
    headers: { 'Api-Key': pineconeKey(), 'Content-Type': 'application/json', 'X-Pinecone-Api-Version': '2025-04' },
    body: JSON.stringify({
      name: INDICE,
      vector_type: 'dense',
      dimension: 1024,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
      deletion_protection: 'disabled',
    }),
  });
  const data = await res.json();
  if (res.ok && data.host) {
    // El índice recién creado tarda unos segundos en quedar operativo.
    await esperarListo(data.host);
    return data.host;
  }
  if (res.status === 409) {
    const desc = await fetch(`${PINECONE_API}/indexes/${INDICE}`, {
      headers: { 'Api-Key': pineconeKey(), 'X-Pinecone-Api-Version': '2025-04' },
    }).then(r => r.json());
    if (desc?.host) return desc.host;
  }
  throw new Error(data?.error?.message || data?.message || `No se pudo crear el índice en Pinecone (${res.status})`);
}

async function esperarListo(host) {
  for (let i = 0; i < 10; i++) {
    const desc = await fetch(`${PINECONE_API}/indexes/${INDICE}`, {
      headers: { 'Api-Key': pineconeKey(), 'X-Pinecone-Api-Version': '2025-04' },
    }).then(r => r.json()).catch(() => null);
    if (desc?.status?.ready) return;
    await new Promise(r => setTimeout(r, 2000));
  }
}

export async function embeddings(textos, tipo = 'passage') {
  const res = await fetch(`${PINECONE_API}/embed`, {
    method: 'POST',
    headers: { 'Api-Key': pineconeKey(), 'Content-Type': 'application/json', 'X-Pinecone-Api-Version': '2025-04' },
    body: JSON.stringify({
      model: MODELO_EMBED,
      parameters: { input_type: tipo, truncate: 'END' },
      inputs: textos.map(t => ({ text: t })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Pinecone embed ${res.status}`);
  return (data.data || []).map(d => d.values);
}

export async function upsertVectores(vectores, namespace = 'obra') {
  const host = await hostIndice();
  const res = await fetch(`https://${host}/vectors/upsert`, {
    method: 'POST',
    headers: { 'Api-Key': pineconeKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ vectors: vectores, namespace }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Pinecone upsert ${res.status}`);
  return data;
}

export async function consultarVectores(vector, { topK = 6, namespace = 'obra', filtro = null } = {}) {
  const host = await hostIndice();
  const res = await fetch(`https://${host}/query`, {
    method: 'POST',
    headers: { 'Api-Key': pineconeKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vector, topK, namespace, includeMetadata: true,
      ...(filtro ? { filter: filtro } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Pinecone query ${res.status}`);
  return (data.matches || []).map(m => ({
    id: m.id,
    score: m.score,
    ...(m.metadata || {}),
  }));
}

/* ─────────────── NEO4J · GRAFO DE CONOCIMIENTO ─────────────── */
// Query API v2 sobre HTTPS (Aura). El grafo relaciona partidas, especialidades,
// normas, documentos, NCs y RDIs: eso es lo que un vector solo no puede resolver.
export async function grafo(statement, parameters = {}) {
  const uri = secrets.get('NEO4J_URI');
  const user = secrets.get('NEO4J_USER');
  const pass = secrets.get('NEO4J_PASSWORD');
  if (!uri || !user || !pass) throw new Error('Faltan credenciales de Neo4j');
  const base = uri.replace(/^neo4j\+s?:\/\//, 'https://').replace(/^bolt(\+s)?:\/\//, 'https://').replace(/\/$/, '');
  const res = await fetch(`${base}/db/neo4j/query/v2`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${user}:${pass}`)}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ statement, parameters }),
  });
  const data = await res.json();
  if (!res.ok || data.errors?.length) {
    throw new Error(data?.errors?.[0]?.message || `Neo4j ${res.status}`);
  }
  const campos = data.data?.fields || [];
  const filas = (data.data?.values || []).map(v => {
    const fila = {};
    campos.forEach((c, i) => { fila[c] = v[i]; });
    return fila;
  });
  return filas;
}

/* ─────────────── TROCEADO ─────────────── */
export function trocearTexto(texto, max = 1400) {
  const parrafos = (texto || '').split(/\n{2,}/);
  const tramos = [];
  let actual = '';
  for (const p of parrafos) {
    if ((actual + p).length > max && actual) { tramos.push(actual.trim()); actual = ''; }
    actual += p + '\n\n';
  }
  if (actual.trim()) tramos.push(actual.trim());
  return tramos.filter(t => t.length > 80);
}