import {
  Building2, TrendingUp, ClipboardCheck, FileQuestion, CreditCard,
  AlertTriangle, BookOpen, Circle,
} from 'lucide-react';

// Lenguaje visual del grafo: cada tipo de nodo del cerebro Neo4j tiene su
// color e icono, y cada severidad su anillo. Se lee de un vistazo en terreno.
export const TIPOS = {
  Obra: { icon: Building2, color: 'hsl(var(--primary))', label: 'Obra' },
  Partida: { icon: TrendingUp, color: 'hsl(var(--warn))', label: 'Partida' },
  NoConformidad: { icon: ClipboardCheck, color: 'hsl(var(--danger))', label: 'No conformidad' },
  RDI: { icon: FileQuestion, color: 'hsl(var(--info))', label: 'RDI' },
  EDP: { icon: CreditCard, color: 'hsl(var(--ok))', label: 'Estado de pago' },
  Alerta: { icon: AlertTriangle, color: 'hsl(var(--danger))', label: 'Alerta' },
  Documento: { icon: BookOpen, color: 'hsl(var(--muted-foreground))', label: 'Documento' },
};

export const SEVERIDAD = {
  critica: 'hsl(var(--danger))',
  advertencia: 'hsl(var(--warn))',
  ok: 'hsl(var(--ok))',
};

export const metaTipo = (tipo) => TIPOS[tipo] || { icon: Circle, color: 'hsl(var(--muted-foreground))', label: tipo || 'Nodo' };

export const REL_LABEL = {
  CONTIENE: 'contiene',
  AFECTA: 'afecta a',
  BLOQUEA: 'bloquea el pago de',
  CONSULTA: 'consulta sobre',
  PAGA: 'paga',
  ALERTA_DE: 'alerta de',
  ORIGINA: 'origina',
  DOCUMENTA: 'documenta',
};