import { desbloquearAudio } from '@/lib/hablarTexto';

export const GO_MASTER_DEMO = {
  title: 'GoConstruction OS · Centro de Comando',
  voice: 'storm',
  steps: [
    {
      route: '/app', target: 'nav-app', interaction: 'click', hold_ms: 800,
      title: 'Tu Centro de Comando',
      narration: 'Soy GO, el jefe técnico digital de GoConstruction OS. Este es tu Centro de Comando: puedes preguntarme por avance, calidad, RDIs, pagos o documentos sin salir a buscar el dato entre distintas pantallas. Y cuando estés en terreno, WhatsApp funciona como una de mis extremidades operativas: recibo consultas, fotos y archivos, y los conecto con la obra y sus registros.'
    },
    {
      route: '/dashboard', target: 'nav-dashboard', interaction: 'click', hold_ms: 700,
      title: 'Tablero de obra',
      narration: 'Ahora te muestro el backend, no porque tengas que navegarlo todos los días, sino para que veas qué módulos están activos y dónde queda la trazabilidad de lo que hacemos por conversación. Empezamos por el tablero: avance, calidad, RDIs, pagos y alertas en un solo lugar. Cada indicador conserva su origen y te permite bajar al problema que lo está provocando.'
    },
    {
      route: '/evidencia-terreno', target: 'nav-evidencia-terreno', interaction: 'click', hold_ms: 700,
      title: 'Evidencia de terreno',
      narration: 'Vamos a terreno. Una foto, una nota o un documento queda asociado a la obra y a su partida, con responsable, gravedad y ubicación cuando existe. GO describe lo observable, pero no inventa mediciones ni reemplaza la revisión del profesional responsable.'
    },
    {
      route: '/base-conocimiento', target: 'nav-base-conocimiento', interaction: 'click', hold_ms: 700,
      title: 'Base de conocimiento',
      narration: 'Esa evidencia se cruza con el cerebro técnico del proyecto: planos, especificaciones, protocolos y contratos. Cuando GO responde, cita el documento y la página. Si el dato no está, lo dice directo y deja claro qué falta revisar.'
    },
    {
      route: '/qa-terreno', target: 'nav-qa-terreno', interaction: 'click', hold_ms: 700,
      title: 'Control de calidad',
      narration: 'Miremos un caso concreto. Aparece una no conformidad crítica. Queda registrada con evidencia, responsable, gravedad y estado. Desde este punto, calidad deja de ser una observación suelta y empieza a controlar lo que puede, o no puede, avanzar.'
    },
    {
      route: '/semaforo-pagos', target: 'nav-semaforo-pagos', interaction: 'click', hold_ms: 800,
      title: 'Semáforo de pagos',
      narration: 'Seguimos la cadena. La no conformidad afecta su partida y llega al estado de pago asociado. La regla es simple: sin calidad verificada, no se paga. Para liberar el bloqueo se necesita evidencia de cierre, responsable y validación. Las tareas que exigen revisión, firma o autorización mantienen sus controles en la plataforma.'
    },
    {
      route: '/gestor-rdi', target: 'nav-gestor-rdi', interaction: 'click', hold_ms: 700,
      title: 'Gestor de RDIs',
      narration: 'Si el problema requiere una definición técnica, GO revisa primero si ya existe un RDI aplicable. Así evitamos consultas repetidas. Si todavía falta información, prepara el nuevo requerimiento con prioridad, especialista y fecha de respuesta.'
    },
    {
      route: '/monitor-avance', target: 'nav-monitor-avance', interaction: 'click', hold_ms: 700,
      title: 'Monitor de avance',
      narration: 'Después revisamos programa. GO compara avance real y programado por partida, detecta dónde se abrió la brecha y la conecta con el frente y su responsable. La conversación cambia: ya no es cuánto atraso tenemos, sino qué restricción debemos levantar primero.'
    },
    {
      route: '/centro-alertas', target: 'nav-centro-alertas', interaction: 'click', hold_ms: 700,
      title: 'Centro de alertas',
      narration: 'Las alertas ordenan la atención del equipo. Calidad, desviaciones, RDIs vencidos y pagos retenidos llegan al rol que debe intervenir. Si no hay respuesta, el escalamiento queda trazado; GO acompaña la decisión, pero no se salta a las personas responsables.'
    },
    {
      route: '/app', target: 'nav-app', interaction: 'click', hold_ms: 900,
      title: 'Orquestación GO',
      narration: 'Volvemos al Centro de Comando. Acá se entiende el valor completo: una no conformidad afecta una partida, retiene un pago y genera una alerta. Si el análisis es más profundo, GO coordina Calidad, Programación, Costos, Normativa y Auditoría, y entrega una recomendación única de jefatura.'
    },
    {
      route: '/informe-ejecutivo', target: 'nav-informe-ejecutivo', interaction: 'click', hold_ms: 800,
      title: 'Informe ejecutivo',
      narration: 'Finalmente, todo llega al informe ejecutivo: avance, riesgos, no conformidades, RDIs, pagos y monto retenido. La administración recibe una lectura clara, lista para comité o mandante, y puede exportarla con la misma trazabilidad.'
    },
    {
      route: '/app', target: 'nav-app', interaction: 'click', hold_ms: 1200,
      title: 'Configuración y cierre',
      narration: 'La plataforma puede configurarse por empresa y por obra. Desde este chat puedes solicitar nuevos módulos, vistas o automatizaciones; GO estructura el requerimiento y lo deriva al flujo de configuración correspondiente. Tú conversas conmigo; GoConstruction OS organiza la información, consulta los módulos y deja trazabilidad. Menos navegación, más control de obra. Esto es GoConstruction OS.'
    }
  ]
};

export function startGoMasterDemo() {
  desbloquearAudio();
  window.dispatchEvent(new CustomEvent('go:demo-plan', { detail: GO_MASTER_DEMO }));
}