import { useCallback, useEffect, useState } from 'react';
import { TEMAS, TEMA_POR_DEFECTO, buscarTema } from '@/lib/temasMarca';

const CLAVE = 'gco_tema_marca';

// Aplica el tema pintando los tokens sobre :root. Como todas las pantallas
// consumen tokens, el OS completo se repinta sin tocar una sola vista.
function pintar(tema) {
  const root = document.documentElement;
  Object.entries(tema.tokens).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
  // Los tokens del sidebar siguen a las superficies del tema.
  root.style.setProperty('--sidebar-background', tema.tokens['surface-1']);
  root.style.setProperty('--sidebar-foreground', tema.tokens.foreground);
  root.style.setProperty('--sidebar-primary', tema.tokens.primary);
  root.style.setProperty('--sidebar-primary-foreground', tema.tokens['primary-foreground']);
  root.style.setProperty('--sidebar-accent', tema.tokens['surface-2']);
  root.style.setProperty('--sidebar-accent-foreground', tema.tokens.foreground);
  root.style.setProperty('--sidebar-border', tema.tokens.hairline);
  root.style.setProperty('--sidebar-ring', tema.tokens.primary);
  root.classList.toggle('light', tema.base === 'light');
  root.classList.toggle('dark', tema.base === 'dark');
}

export default function useTemaMarca() {
  const [temaId, setTemaId] = useState(() => localStorage.getItem(CLAVE) || TEMA_POR_DEFECTO);

  useEffect(() => { pintar(buscarTema(temaId)); }, [temaId]);

  const aplicar = useCallback((id) => {
    localStorage.setItem(CLAVE, id);
    setTemaId(id);
  }, []);

  return { temaId, aplicar, temas: TEMAS };
}