import { useEffect } from 'react';

const SITIO = 'https://gobim.lat';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// SEO por página: título, descripción, canónica, Open Graph y datos estructurados.
// El bloque JSON-LD propio de la página se elimina al salir para no acumular schemas.
export default function useSeo({ titulo, descripcion, ruta, imagen, jsonLd }) {
  useEffect(() => {
    const url = `${SITIO}${ruta}`;
    document.title = titulo;
    setMeta('name', 'description', descripcion);
    setCanonical(url);
    setMeta('property', 'og:title', titulo);
    setMeta('property', 'og:description', descripcion);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', titulo);
    setMeta('name', 'twitter:description', descripcion);
    if (imagen) {
      setMeta('property', 'og:image', imagen);
      setMeta('name', 'twitter:image', imagen);
    }

    let script;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoPagina = ruta;
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => { if (script) script.remove(); };
  }, [titulo, descripcion, ruta, imagen, jsonLd]);
}