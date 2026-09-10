import { desbloquearAudio } from '@/lib/hablarTexto';

export const GO_MASTER_DEMO = {
  title: 'GoConstruction OS · Oficina técnica digital',
  voice: 'storm',
  steps: [
    { route: '/app', target: 'nav-app', interaction: 'click', hold_ms: 700, narration: 'Partamos por lo esencial. En una obra, la información suele quedar repartida entre WhatsApp, planos, correos y planillas. GO ordena ese ruido, mantiene el contexto y ayuda a tomar decisiones con respaldo técnico. Te muestro cómo funciona.' },
    { route: '/dashboard', target: 'nav-dashboard', interaction: 'click', hold_ms: 700, narration: 'Primero, el tablero de la obra. Acá vemos avance, calidad, RDIs, pagos y alertas en un solo lugar. No es una foto decorativa: cada indicador conserva su origen y permite bajar al problema que lo está provocando.' },
    { route: '/evidencia-terreno', target: 'nav-evidencia-terreno', interaction: 'click', hold_ms: 700, narration: 'Ahora vamos a terreno. Una foto, una nota o un documento queda asociado a la obra y a su partida, con responsable, gravedad y ubicación cuando existe. GO describe lo observable, pero no inventa mediciones ni reemplaza la revisión del profesional responsable.' },
    { route: '/base-conocimiento', target: 'nav-base-conocimiento', interaction: 'click', hold_ms: 700, narration: 'Esa evidencia se cruza con el cerebro técnico del proyecto: planos, especificaciones, protocolos y contratos. Cuando GO responde, cita el documento y la página. Si el dato no está, lo dice directo y deja claro qué falta revisar.' },
    { route: '/qa-terreno', target: 'nav-qa-terreno', interaction: 'click', hold_ms: 700, narration: 'Miremos un caso concreto. Aparece una no conformidad crítica. Queda registrada con evidencia, responsable, gravedad y estado. Desde este punto, calidad deja de ser una observación suelta y empieza a controlar lo que puede, o no puede, avanzar.' },
    { route: '/semaforo-pagos', target: 'nav-semaforo-pagos', interaction: 'click', hold_ms: 800, narration: 'Seguimos la cadena. La no conformidad afecta su partida y llega al estado de pago asociado. La regla es simple: sin calidad verificada, no se paga. Para liberar el bloqueo se necesita evidencia de cierre, responsable y validación; no basta con marcar una casilla.' },
    { route: '/gestor-rdi', target: 'nav-gestor-rdi', interaction: 'click', hold_ms: 700, narration: 'Si el problema requiere una definición técnica, GO revisa primero si ya existe un RDI aplicable. Así evitamos consultas repetidas. Si todavía falta información, prepara el nuevo requerimiento con prioridad, especialista y fecha de respuesta.' },
    { route: '/monitor-avance', target: 'nav-monitor-avance', interaction: 'click', hold_ms: 700, narration: 'Después revisamos programa. GO compara avance real y programado por partida, detecta dónde se abrió la brecha y la conecta con el frente y su responsable. La conversación cambia: ya no es cuánto atraso tenemos, sino qué restricción debemos levantar primero.' },
    { route: '/centro-alertas', target: 'nav-centro-alertas', interaction: 'click', hold_ms: 700, narration: 'Las alertas ordenan la atención del equipo. Calidad, desviaciones, RDIs vencidos y pagos retenidos llegan al rol que debe intervenir. Si no hay respuesta, el escalamiento queda trazado; GO acompaña la decisión, pero no se salta a las personas responsables.' },
    { route: '/app', target: 'nav-app', interaction: 'click', hold_ms: 900, narration: 'Volvemos con GO. Acá se entiende el valor completo: una no conformidad afecta una partida, retiene un pago y genera una alerta. Si el análisis es más profundo, GO coordina Calidad, Programación, Costos, Normativa y Auditoría, y entrega una recomendación única de jefatura.' },
    { route: '/informe-ejecutivo', target: 'nav-informe-ejecutivo', interaction: 'click', hold_ms: 800, narration: 'Finalmente, todo llega al informe ejecutivo: avance, riesgos, no conformidades, RDIs, pagos y monto retenido. La administración recibe una lectura clara, lista para comité o mandante, y puede exportarla con la misma trazabilidad.' },
    { route: '/polpaico-os', interaction: 'focus', hold_ms: 1200, narration: 'Y cuando el negocio lo requiere, esta lógica se especializa por industria y proceso, como en Polpaico OS, sin confundir una demostración con una operación real. En simple: no digitalizamos el chat. Estructuramos la decisión antes de que el problema golpee la calidad, el plazo o el margen. Esto es GoConstruction OS.' }
  ]
};

export function startGoMasterDemo() {
  desbloquearAudio();
  window.dispatchEvent(new CustomEvent('go:demo-plan', { detail: GO_MASTER_DEMO }));
}