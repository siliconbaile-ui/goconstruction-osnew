import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { scrapeUrl, buscarWeb, mapearSitio } from '../../shared/conocimiento.ts';

// Capacidad de raspado de GO (Firecrawl v2): leer una URL o PDF (planos, fichas
// técnicas, normativa), buscar en la web chilena, mapear un sitio o extraer
// datos estructurados con un esquema.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { modo = 'scrape', url, consulta, esquema, prompt, limite = 5 } = await req.json();

    if (modo === 'buscar') {
      if (!consulta) return Response.json({ error: 'consulta requerida' }, { status: 400 });
      const resultados = await buscarWeb(consulta, { limite });
      return Response.json({ modo, resultados });
    }

    if (modo === 'mapear') {
      if (!url) return Response.json({ error: 'url requerida' }, { status: 400 });
      const links = await mapearSitio(url, { busqueda: consulta, limite: 100 });
      return Response.json({ modo, links });
    }

    if (!url) return Response.json({ error: 'url requerida' }, { status: 400 });
    const data = await scrapeUrl(url, { esquema, prompt });
    return Response.json({
      modo: 'scrape',
      url,
      titulo: data.metadata?.title || null,
      paginas: data.metadata?.numPages || null,
      contenido: (data.markdown || '').slice(0, 30000),
      extraccion: data.json || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}