import useTemaMarca from '@/hooks/useTemaMarca';

// Compatibilidad: el modo claro/oscuro vive ahora en el sistema de temas de
// marca, que aplica la variante clara u oscura de la paleta activa.
export default function useTheme() {
  const { modo, setModo, alternarModo } = useTemaMarca();
  return { theme: modo, setTheme: setModo, toggle: alternarModo };
}