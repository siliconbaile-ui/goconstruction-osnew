import {
  AlertTriangle, TrendingUp, FileQuestion, ClipboardCheck, CreditCard,
  Building2, FileBarChart, BookOpen, Search, ArrowUpCircle, Wrench,
} from 'lucide-react';

// Identidad visual por tarea: cada herramienta del agente se ve distinta
// para que en terreno se reconozca de un vistazo qué está haciendo GO.
const MAPA = [
  { re: /alerta/i, icon: AlertTriangle, titulo: 'Alertas', accent: 'danger' },
  { re: /escalar/i, icon: ArrowUpCircle, titulo: 'Escalamiento', accent: 'danger' },
  { re: /partida|desviacion|avance/i, icon: TrendingUp, titulo: 'Avance de partidas', accent: 'warn' },
  { re: /requerimiento|rdi/i, icon: FileQuestion, titulo: 'RDIs', accent: 'info' },
  { re: /inspeccion|calidad|nc/i, icon: ClipboardCheck, titulo: 'Calidad e inspecciones', accent: 'ok' },
  { re: /pago|edp/i, icon: CreditCard, titulo: 'Estados de pago', accent: 'primary' },
  { re: /proyecto|obra/i, icon: Building2, titulo: 'Obra', accent: 'primary' },
  { re: /informe/i, icon: FileBarChart, titulo: 'Informe ejecutivo', accent: 'primary' },
  { re: /conocimiento|documento/i, icon: BookOpen, titulo: 'Base de conocimiento', accent: 'info' },
  { re: /verificar|buscar/i, icon: Search, titulo: 'Verificación', accent: 'info' },
];

export default function toolMeta(nombre = '') {
  const hit = MAPA.find(m => m.re.test(nombre));
  const base = hit || { icon: Wrench, titulo: 'Herramienta', accent: 'muted-foreground' };
  const token = base.accent;
  return {
    icon: base.icon,
    titulo: base.titulo,
    color: `hsl(var(--${token}))`,
    colorSuave: `hsl(var(--${token}) / 0.14)`,
  };
}