import { desbloquearAudio } from '@/lib/hablarTexto';

export const GO_MASTER_DEMO = {
  title: 'GoConstruction OS · Oficina técnica digital',
  voice: 'honey',
  steps: [
    { route: '/app', target: 'nav-app', interaction: 'click', hold_ms: 900, narration: 'En una obra, las decisiones críticas siguen repartidas entre conversaciones, planos, correos, planillas y memoria. GO convierte ese ruido en control técnico verificable: la obra conversa, GO recuerda, verifica y ejecuta con gobernanza.' },
    { route: '/dashboard', target: 'nav-dashboard', interaction: 'click', hold_ms: 900, narration: 'Entramos a una obra identificada y trazable. El centro de comando reúne avance, calidad, requerimientos de información, pagos y alertas sin ocultar el origen de cada dato.' },
    { route: '/evidencia-terreno', target: 'nav-evidencia-terreno', interaction: 'click', hold_ms: 900, narration: 'La evidencia nace en terreno. Una foto o archivo puede quedar asociado a su obra y partida, conservando descripción, gravedad, responsable y ubicación cuando está disponible. Una observación visual nunca se presenta como medición ni autorización.' },
    { route: '/base-conocimiento', target: 'nav-base-conocimiento', interaction: 'click', hold_ms: 900, narration: 'Planos, especificaciones, protocolos y contratos forman el cerebro técnico de la obra. GO recupera fragmentos verificables y cita documento y página; si la evidencia falta, identifica el vacío en vez de inventar una respuesta.' },
    { route: '/qa-terreno', target: 'nav-qa-terreno', interaction: 'click', hold_ms: 900, narration: 'Aquí comienza el caso conductor. Una no conformidad crítica conserva evidencia, responsable, gravedad y estado. La calidad deja de ser una observación aislada y pasa a gobernar la siguiente decisión.' },
    { route: '/semaforo-pagos', target: 'nav-semaforo-pagos', interaction: 'click', hold_ms: 1000, narration: 'La no conformidad se conecta con su partida y con el estado de pago asociado. No Quality, No Pay: la calidad verificable se revisa antes de la firma, y toda liberación exige evidencia, responsable y controles de cierre.' },
    { route: '/gestor-rdi', target: 'nav-gestor-rdi', interaction: 'click', hold_ms: 900, narration: 'Antes de crear un nuevo requerimiento de información, GO busca precedentes aplicables. El conocimiento respondido se reutiliza con trazabilidad; si el vacío continúa, el RDI queda preparado con prioridad, especialista y vencimiento.' },
    { route: '/monitor-avance', target: 'nav-monitor-avance', interaction: 'click', hold_ms: 900, narration: 'El avance programado se contrasta con el avance real por partida. Las desviaciones dejan de ser porcentajes aislados y se convierten en frentes, responsables y acciones que pueden proteger plazo y margen.' },
    { route: '/centro-alertas', target: 'nav-centro-alertas', interaction: 'click', hold_ms: 900, narration: 'Las alertas conectan desviaciones, calidad, requerimientos vencidos y pagos retenidos con el rol que debe intervenir. El escalamiento permanece trazable y nunca reemplaza el control humano.' },
    { route: '/app', target: 'nav-app', interaction: 'click', hold_ms: 1100, narration: 'GO comprende la obra como una red causal: no conformidad crítica, partida bloqueada, pago retenido y alerta. Cuando el análisis exige profundidad, coordina Normativa, Calidad, Programación, Costos y Auditoría, y mantiene una sola recomendación de jefatura.' },
    { route: '/informe-ejecutivo', target: 'nav-informe-ejecutivo', interaction: 'click', hold_ms: 1000, narration: 'Cada semana, la evidencia operativa converge en un informe ejecutivo con avance, riesgos, no conformidades, requerimientos, pagos y dinero retenido. La administración recibe una decisión lista para comité o mandante, exportable a PDF.' },
    { route: '/polpaico-os', interaction: 'focus', hold_ms: 1400, narration: 'Las mismas capacidades pueden especializarse por industria y proceso, como Polpaico OS, sin confundir una demostración con una integración productiva. No digitalizamos el chat: estructuramos la decisión antes de que el error afecte calidad, plazo o margen. Esto es GoConstruction OS.' }
  ]
};

export function startGoMasterDemo() {
  desbloquearAudio();
  window.dispatchEvent(new CustomEvent('go:demo-plan', { detail: GO_MASTER_DEMO }));
}