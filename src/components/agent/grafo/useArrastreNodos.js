import { useState, useEffect, useRef, useCallback } from 'react';

// Permite arrastrar los nodos del grafo: mantiene las posiciones manuales
// sobre el layout automático y traduce coordenadas de pantalla al viewBox SVG.
export function useArrastreNodos(nodosLayout, { ancho, alto }) {
  const svgRef = useRef(null);
  const [movidos, setMovidos] = useState({});
  const [arrastrando, setArrastrando] = useState(null);

  // Nuevo grafo (otro modo o foco): se descartan las posiciones manuales.
  useEffect(() => { setMovidos({}); }, [nodosLayout]);

  const aViewBox = useCallback((e) => {
    const caja = svgRef.current?.getBoundingClientRect();
    if (!caja) return null;
    // El SVG usa preserveAspectRatio meet: se calcula la escala real dibujada.
    const escala = Math.min(caja.width / ancho, caja.height / alto);
    const offX = (caja.width - ancho * escala) / 2;
    const offY = (caja.height - alto * escala) / 2;
    return {
      x: (e.clientX - caja.left - offX) / escala,
      y: (e.clientY - caja.top - offY) / escala,
    };
  }, [ancho, alto]);

  const iniciar = (id) => (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setArrastrando({ id, movio: false });
  };

  const mover = (e) => {
    if (!arrastrando) return;
    const p = aViewBox(e);
    if (!p) return;
    setArrastrando(a => (a ? { ...a, movio: true } : a));
    setMovidos(prev => ({
      ...prev,
      [arrastrando.id]: {
        x: Math.max(30, Math.min(ancho - 30, p.x)),
        y: Math.max(24, Math.min(alto - 24, p.y)),
      },
    }));
  };

  const soltar = () => setArrastrando(null);

  const posicionar = (nodo) => ({ ...nodo, ...(movidos[nodo.id] || {}) });
  const seMovio = () => !!arrastrando?.movio;
  const reordenar = () => setMovidos({});

  return { svgRef, posicionar, iniciar, mover, soltar, seMovio, reordenar, hayMovidos: Object.keys(movidos).length > 0, arrastrandoId: arrastrando?.id };
}