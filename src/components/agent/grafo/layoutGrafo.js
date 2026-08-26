// Layout de fuerzas mínimo y determinista: repulsión entre nodos, resortes en
// las aristas y gravedad al centro. Suficiente para leer la topología de la
// obra en el chat, sin dependencias externas.
export function calcularLayout(nodos, aristas, { ancho = 640, alto = 420, pasos = 260 } = {}) {
  const cx = ancho / 2;
  const cy = alto / 2;
  const n = nodos.length || 1;
  const radio = Math.min(ancho, alto) * 0.36;

  const pos = nodos.map((nodo, i) => {
    const ang = (i / n) * Math.PI * 2;
    return { id: nodo.id, x: cx + Math.cos(ang) * radio, y: cy + Math.sin(ang) * radio, vx: 0, vy: 0 };
  });
  const idx = new Map(pos.map((p, i) => [p.id, i]));
  const links = aristas
    .map(a => ({ s: idx.get(a.origen), t: idx.get(a.destino) }))
    .filter(l => l.s !== undefined && l.t !== undefined);

  const grados = new Array(pos.length).fill(0);
  links.forEach(l => { grados[l.s]++; grados[l.t]++; });

  // Los nodos se dibujan como casillas: la separación ideal es mayor que con círculos.
  const distanciaIdeal = Math.max(96, Math.min(190, 900 / Math.sqrt(n)));

  for (let paso = 0; paso < pasos; paso++) {
    const enfriamiento = 1 - paso / pasos;
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        let dx = pos[j].x - pos[i].x;
        let dy = pos[j].y - pos[i].y;
        let d2 = dx * dx + dy * dy || 0.01;
        const d = Math.sqrt(d2);
        const f = (distanciaIdeal * distanciaIdeal * 1.1) / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        pos[i].vx -= fx; pos[i].vy -= fy;
        pos[j].vx += fx; pos[j].vy += fy;
      }
    }
    for (const l of links) {
      const a = pos[l.s], b = pos[l.t];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - distanciaIdeal) * 0.06;
      const fx = (dx / d) * f, fy = (dy / d) * f;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }
    for (const p of pos) {
      p.vx += (cx - p.x) * 0.012;
      p.vy += (cy - p.y) * 0.012;
      p.x += p.vx * enfriamiento * 0.55;
      p.y += p.vy * enfriamiento * 0.55;
      p.vx *= 0.82; p.vy *= 0.82;
      p.x = Math.max(100, Math.min(ancho - 100, p.x));
      p.y = Math.max(26, Math.min(alto - 26, p.y));
    }
  }

  return nodos.map((nodo, i) => ({
    ...nodo,
    x: pos[i].x,
    y: pos[i].y,
    grado: grados[i],
    r: 7 + Math.min(9, grados[i] * 1.6),
  }));
}