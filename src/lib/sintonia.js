// Sintonía por cargo: GO recibe a cada perfil con los accesos y preguntas
// que le importan a SU pega, no un menú genérico.
import { AlertTriangle, TrendingUp, FileText, CreditCard, Camera, ShieldCheck, BookOpen, HardHat, Gauge, Wallet } from 'lucide-react';

const BASE = {
  saludo: 'Dime qué te preocupa y te muestro la obra en vivo, con la norma y la página citada.',
  tiles: [
    { label: 'Ver alertas', sub: 'activas ahora', icon: AlertTriangle, prompt: '¿Qué alertas activas tengo ahora?' },
    { label: 'Resumir avance', sub: 'desviaciones clave', icon: TrendingUp, prompt: 'Resume las desviaciones de avance críticas' },
    { label: 'Gestionar RDIs', sub: 'abiertos y vencidos', icon: FileText, prompt: 'Lista los RDIs abiertos y vencidos' },
    { label: 'Revisar pagos', sub: 'EDPs bloqueados', icon: CreditCard, prompt: '¿Qué EDPs están bloqueados y por qué?' },
  ],
  chips: ['¿Qué es lo más urgente hoy?', 'Tengo atraso en enfierradura', 'Escala lo que lleva +24h', '¿Cuánto dinero está retenido?'],
};

const POR_CARGO = {
  gerencia: {
    saludo: 'Te doy el semáforo de la obra, la desviación y el monto en riesgo — con la decisión que hay que tomar.',
    tiles: [
      { label: 'Semáforo general', sub: 'estado de la obra', icon: Gauge, prompt: 'Dame el semáforo general de la obra: avance, calidad, pagos y riesgo' },
      { label: 'Dinero en riesgo', sub: 'retenido y bloqueado', icon: Wallet, prompt: '¿Cuánto dinero está retenido o bloqueado y por qué?' },
      { label: 'Desviación', sub: 'real vs programa', icon: TrendingUp, prompt: 'Muéstrame la desviación de avance real versus programado' },
      { label: 'Informe ejecutivo', sub: 'para el directorio', icon: FileText, prompt: 'Genera un resumen ejecutivo del estado de la obra' },
    ],
    chips: ['¿Qué decisión requiere mi firma hoy?', '¿Cómo viene la curva S?', 'Grafo de riesgo de la obra'],
  },
  administrador_obra: {
    saludo: 'Plata, plazo y subcontratos: te muestro qué EDP está trabado, cuánto retiene y qué lo desbloquea.',
    tiles: [
      { label: 'EDPs bloqueados', sub: 'y su causa raíz', icon: Wallet, prompt: '¿Qué EDPs están bloqueados, cuánto retienen y qué los desbloquea?' },
      { label: 'Subcontratos', sub: 'estado y F30', icon: FileText, prompt: 'Estado de los subcontratistas: avance, NCs y pagos pendientes' },
      { label: 'Desviaciones', sub: 'impacto en plazo', icon: TrendingUp, prompt: 'Resume las desviaciones de avance y su impacto en plazo y dinero' },
      { label: 'Ver alertas', sub: 'activas ahora', icon: AlertTriangle, prompt: '¿Qué alertas activas tengo ahora?' },
    ],
    chips: ['¿Cuánto dinero está retenido?', '¿Qué firmo hoy?', 'Grafo de pagos de la obra'],
  },
  jefe_terreno: {
    saludo: 'Frente por frente: qué hacer hoy, qué está trabado y qué NO se vacía sin liberación.',
    tiles: [
      { label: 'Frentes de hoy', sub: 'qué hacer primero', icon: HardHat, prompt: '¿Qué frentes debo atacar hoy y en qué orden?' },
      { label: 'NCs abiertas', sub: 'por cerrar', icon: ShieldCheck, prompt: '¿Qué no conformidades están abiertas y qué falta para cerrarlas?' },
      { label: 'Registrar avance', sub: 'dictar o escribir', icon: TrendingUp, prompt: 'Quiero registrar el avance de una partida' },
      { label: 'Ver alertas', sub: 'activas ahora', icon: AlertTriangle, prompt: '¿Qué alertas activas tengo ahora?' },
    ],
    chips: ['¿Qué es lo más urgente hoy?', 'Tengo atraso en enfierradura', '¿Puedo vaciar la losa 3?'],
  },
  jefe_calidad: {
    saludo: 'Inspecciones, PPI y cierre de NCs: te digo qué liberar, qué rechazar y qué pago depende de ti.',
    tiles: [
      { label: 'NCs abiertas', sub: 'gravedad y plazo', icon: ShieldCheck, prompt: 'Lista las no conformidades abiertas por gravedad y fecha límite' },
      { label: 'Liberaciones', sub: 'antes del vaciado', icon: HardHat, prompt: '¿Qué liberaciones de calidad están pendientes antes de vaciar?' },
      { label: 'Pagos por calidad', sub: 'EDPs que dependen', icon: Wallet, prompt: '¿Qué EDPs están bloqueados por calidad y qué NC los libera?' },
      { label: 'Registrar inspección', sub: 'foto y GPS', icon: Camera, prompt: 'Quiero registrar una inspección de calidad' },
    ],
    chips: ['¿Qué NC vence esta semana?', 'Grafo de calidad de la obra', '¿Qué exige la EETT para el curado?'],
  },
  oficina_tecnica: {
    saludo: 'RDIs, planos y EETT: te respondo con documento y página exacta, y detecto RDIs redundantes antes de emitirlos.',
    tiles: [
      { label: 'Gestionar RDIs', sub: 'abiertos y vencidos', icon: FileText, prompt: 'Lista los RDIs abiertos y vencidos' },
      { label: 'Consultar EETT', sub: 'cita con página', icon: BookOpen, prompt: 'Quiero hacer una consulta técnica a las EETT del proyecto' },
      { label: 'Documentos', sub: 'indexados y vigentes', icon: FileText, prompt: '¿Qué documentos técnicos están indexados y vigentes?' },
      { label: 'Ver alertas', sub: 'activas ahora', icon: AlertTriangle, prompt: '¿Qué alertas activas tengo ahora?' },
    ],
    chips: ['¿Este RDI ya se preguntó antes?', '¿Qué recubrimiento exige la EETT?', 'Grafo de la obra'],
  },
  prevencionista: {
    saludo: 'DS 594, Ley 16.744 y riesgos de terreno: te digo qué observar y qué norma lo exige.',
    tiles: [
      { label: 'Riesgos críticos', sub: 'en terreno hoy', icon: AlertTriangle, prompt: '¿Qué riesgos de seguridad críticos hay en la obra hoy?' },
      { label: 'Normativa', sub: 'DS 594 · Ley 16.744', icon: BookOpen, prompt: '¿Qué exige el DS 594 para los trabajos actuales de la obra?' },
      { label: 'NCs de seguridad', sub: 'abiertas', icon: ShieldCheck, prompt: 'Lista las no conformidades de seguridad abiertas' },
      { label: 'Registrar hallazgo', sub: 'foto y GPS', icon: Camera, prompt: 'Quiero registrar un hallazgo de seguridad con foto' },
    ],
    chips: ['¿Excavación sobre 1,5 m qué exige?', '¿Trabajo en altura hoy?', '¿Comité paritario al día?'],
  },
  capataz: {
    saludo: 'Mándame una foto o dime el avance y lo dejo registrado al tiro. Sin vueltas.',
    tiles: [
      { label: 'Registrar avance', sub: 'dicta y listo', icon: TrendingUp, prompt: 'Quiero registrar el avance de mi frente' },
      { label: 'Mandar foto', sub: 'queda registrada', icon: Camera, prompt: 'Quiero registrar una foto de terreno' },
      { label: 'Lo urgente hoy', sub: 'mi frente', icon: AlertTriangle, prompt: '¿Qué es lo más urgente en mi frente hoy?' },
      { label: 'Consultar medida', sub: 'EETT con página', icon: BookOpen, prompt: 'Tengo una duda técnica de terreno' },
    ],
    chips: ['¿Puedo vaciar?', 'Se atrasó el subcontrato', '¿Qué espesor lleva el radier?'],
  },
};

export function sintoniaPorCargo(cargo) {
  return POR_CARGO[cargo] || BASE;
}