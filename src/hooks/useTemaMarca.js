import { useCallback, useEffect, useState } from 'react';
import { TEMAS, TEMA_POR_DEFECTO, MODO_POR_DEFECTO, buscarTema, tokensCompletos } from '@/lib/temasMarca';

const CLAVE_TEMA = 'gco_tema_marca';
const CLAVE_MODO = 'gco_modo_luz';
const EVENTO = 'gco-tema-cambio';

function leer() {
  return {
    temaId: localStorage.getItem(CLAVE_TEMA) || TEMA_POR_DEFECTO,
    modo: localStorage.getItem(CLAVE_MODO) || MODO_POR_DEFECTO,
  };
}

// Pinta los tokens sobre :root. Como todas las pantallas consumen tokens,
// el OS completo se repinta sin tocar una sola vista.
export function pintarTema(temaId, modo) {
  const tema = buscarTema(temaId);
  const root = document.documentElement;
  Object.entries(tokensCompletos(tema, modo)).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
  root.classList.toggle('light', modo === 'light');
  root.classList.toggle('dark', modo === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', tema.swatches[modo][0]);
}

export default function useTemaMarca() {
  const [estado, setEstado] = useState(leer);

  useEffect(() => { pintarTema(estado.temaId, estado.modo); }, [estado]);

  // Sincroniza todas las instancias del hook (header + manual de marca).
  useEffect(() => {
    const escuchar = () => setEstado(leer());
    window.addEventListener(EVENTO, escuchar);
    return () => window.removeEventListener(EVENTO, escuchar);
  }, []);

  const guardar = useCallback((temaId, modo) => {
    localStorage.setItem(CLAVE_TEMA, temaId);
    localStorage.setItem(CLAVE_MODO, modo);
    window.dispatchEvent(new Event(EVENTO));
    setEstado({ temaId, modo });
  }, []);

  const aplicar = useCallback((id) => guardar(id, leer().modo), [guardar]);
  const setModo = useCallback((m) => guardar(leer().temaId, m), [guardar]);
  const alternarModo = useCallback(() => {
    const { temaId, modo } = leer();
    guardar(temaId, modo === 'dark' ? 'light' : 'dark');
  }, [guardar]);

  return { ...estado, aplicar, setModo, alternarModo, temas: TEMAS, tema: buscarTema(estado.temaId) };
}