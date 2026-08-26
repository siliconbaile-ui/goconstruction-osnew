// Contenido de las landings por caso de uso. Cada caso es una intención de
// búsqueda distinta del mercado chileno, con su propio dolor, prueba y chat.
const IMG_OG = 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/e3fc0c4dc_generated_image.png';

export const CASOS = {
  'control-calidad': {
    ruta: '/control-calidad',
    seoTitulo: 'Control de calidad en obra · Software de NC y protocolos · Chile',
    seoDescripcion: 'Controla no conformidades, protocolos de liberación e inspecciones en terreno con criterio técnico. GO cita la NCh y la página exacta de tus EETT, y bloquea el estado de pago si hay una NC crítica abierta. Para constructoras en Chile.',
    etiqueta: 'CALIDAD Y NO CONFORMIDADES',
    h1: 'La NC crítica no se pierde en un WhatsApp',
    bajada: 'Cada inspección, protocolo de liberación y no conformidad queda registrada, con foto georreferenciada, responsable y plazo de cierre. Si la NC es crítica, el pago de esa partida no avanza hasta que se cierre con evidencia.',
    dolor: [
      'Las observaciones de la ITO viven en fotos de WhatsApp y planillas que nadie consolida.',
      'Se paga una partida que después hay que rehacer, porque la NC nunca se cerró.',
      'Nadie sabe qué dice exactamente la EETT o la NCh cuando hay que decidir en terreno.',
    ],
    beneficios: [
      { titulo: 'Cita la norma y la página', texto: 'GO responde con el documento, la sección y la página: NCh 430 para hormigón armado, tus EETT, el protocolo del proyecto. Sirve para defender la decisión ante la ITO.' },
      { titulo: 'NC con evidencia y plazo', texto: 'Foto con coordenadas, gravedad, responsable y fecha límite de cierre. El cierre exige evidencia nueva, no una promesa.' },
      { titulo: 'Bloqueo automático de pago', texto: 'Una NC crítica abierta bloquea el EDP de la partida. El control de calidad deja de ser una recomendación.' },
      { titulo: 'Escalamiento por tiempo', texto: 'Si la NC crítica no se mueve, sube sola de jefe de terreno a gerencia. Nada queda esperando un correo.' },
    ],
    chatSaludo: 'Soy GO. Cuéntame qué problema de calidad tienes hoy en obra y te muestro cómo lo resolvería con tus documentos.',
    chatChips: [
      '¿Cómo registran una no conformidad crítica?',
      '¿Qué dice la NCh 430 sobre recubrimiento en losa?',
      '¿Cómo bloquean el pago por una NC?',
    ],
    faq: [
      { p: '¿Sirve si ya usamos otra herramienta de calidad?', r: 'Sí. Se puede cargar la información de avance y calidad desde planillas o desde herramientas como NUPAV, y GO trabaja sobre esos datos sin que tengas que cambiar tu proceso de un día para otro.' },
      { p: '¿Las fotos quedan georreferenciadas?', r: 'Sí. La evidencia de terreno guarda coordenadas y precisión GPS, de modo que la observación queda ubicada en la obra y no solo descrita en texto.' },
    ],
  },

  'edp-pagos': {
    ruta: '/edp-pagos',
    seoTitulo: 'Gestión de EDP y estados de pago de subcontratistas · Chile',
    seoDescripcion: 'Estados de pago con avance verificado y calidad verificada antes de la firma. Retenciones, porcentaje de avance y bloqueo automático por no conformidad crítica. Software de gestión de EDP para constructoras en Chile.',
    etiqueta: 'ESTADOS DE PAGO',
    h1: 'Ningún EDP se firma sin avance y calidad verificados',
    bajada: 'El estado de pago llega a tu firma con el avance real cruzado contra el programado y la calidad de la partida revisada. Si algo no cuadra, GO te dice qué y con qué evidencia antes de que firmes.',
    dolor: [
      'Se firman EDP sobre porcentajes declarados por el subcontratista, sin verificación cruzada.',
      'Se paga trabajo con no conformidades abiertas y después no hay palanca para exigir el arreglo.',
      'Reconstruir el historial de un EDP para una discusión contractual toma días.',
    ],
    beneficios: [
      { titulo: 'Doble verificación antes de firmar', texto: 'Avance verificado y calidad verificada son dos condiciones explícitas del EDP. Sin ambas, queda pendiente y con motivo declarado.' },
      { titulo: 'Bloqueo por no conformidad', texto: 'Si la partida tiene una NC crítica abierta, el EDP se bloquea automáticamente e indica cuáles son las NC responsables.' },
      { titulo: 'Trazabilidad contractual', texto: 'Cada EDP guarda monto, porcentaje, subcontratista, quién firmó, cuándo y por qué se rechazó o se bloqueó. El historial existe cuando lo necesitas.' },
      { titulo: 'Semáforo por partida', texto: 'Ves de una sola vista qué está bloqueado, qué espera firma y cuánto dinero está detenido y por qué motivo.' },
    ],
    chatSaludo: 'Soy GO. Dime cómo revisas hoy los estados de pago y te muestro dónde se te está escapando plata.',
    chatChips: [
      '¿Cómo verifican el avance antes de pagar?',
      '¿Qué pasa si el subcontratista declara más avance del real?',
      '¿Cómo se calcula la retención de un EDP?',
    ],
    faq: [
      { p: '¿Se puede desbloquear un EDP manualmente?', r: 'El bloqueo por no conformidad crítica exige cerrar la NC con evidencia; la decisión queda registrada con responsable, de modo que cualquier excepción es visible y trazable.' },
      { p: '¿Maneja montos y porcentajes de avance por partida?', r: 'Sí. Cada estado de pago está asociado a una partida de control con su monto de contrato, su porcentaje de avance y su subcontratista.' },
    ],
  },

  'rdi-automaticos': {
    ruta: '/rdi-automaticos',
    seoTitulo: 'Gestión de RDI en obra · Respuestas técnicas con cita de plano · Chile',
    seoDescripcion: 'Emite, responde y cierra RDIs sin que se venzan. GO detecta el RDI redundante antes de emitirlo, propone respuesta técnica citando planos y EETT, y alerta los vencimientos. Software de RDI para constructoras en Chile.',
    etiqueta: 'RDI · REQUERIMIENTOS DE INFORMACIÓN',
    h1: 'El RDI se responde antes de frenar la obra',
    bajada: 'Antes de emitir un RDI, GO busca si ya fue preguntado y respondido en este proyecto. Si es nuevo, propone una respuesta técnica citando el plano y la página, y vigila el plazo hasta que se cierre.',
    dolor: [
      'Se emiten RDIs repetidos que ya tenían respuesta en un correo de hace tres meses.',
      'El RDI se vence sin que nadie lo note y la partida queda detenida.',
      'La respuesta llega sin respaldo técnico y se discute otra vez en terreno.',
    ],
    beneficios: [
      { titulo: 'Detección de RDI redundante', texto: 'Antes de crear el requerimiento, GO revisa los RDIs previos del proyecto y te muestra el precedente si existe. Menos ruido con el mandante.' },
      { titulo: 'Respuesta sugerida con fuente', texto: 'Propone la respuesta técnica citando plano, EETT o normativa, con nivel de confianza declarado. Tú validas, no redactas de cero.' },
      { titulo: 'Vigilancia de vencimientos', texto: 'Los RDIs próximos a vencer y los vencidos generan alerta y escalan solos según prioridad.' },
      { titulo: 'Evidencia georreferenciada', texto: 'El RDI puede nacer de una foto de terreno con coordenadas, así el especialista entiende el contexto real sin ir a la obra.' },
    ],
    chatSaludo: 'Soy GO. Plantéame la duda técnica como se la plantearías al proyectista y te muestro cómo se convierte en un RDI bien fundado.',
    chatChips: [
      '¿Cómo detectan un RDI repetido?',
      '¿Cómo proponen la respuesta técnica?',
      '¿Qué pasa cuando un RDI está por vencer?',
    ],
    faq: [
      { p: '¿Reemplaza al proyectista?', r: 'No. Propone una respuesta fundada y citada para acelerar la discusión, pero la respuesta oficial la valida el especialista responsable, que queda registrado en el RDI.' },
      { p: '¿Necesita que subamos los planos?', r: 'Sí, para citar con precisión necesita los documentos técnicos del proyecto cargados e indexados: planos, especificaciones y protocolos.' },
    ],
  },

  'whatsapp-bim': {
    ruta: '/whatsapp-bim',
    seoTitulo: 'WhatsApp para obra · Foto del capataz a registro técnico · Chile',
    seoDescripcion: 'El capataz manda la foto por WhatsApp y queda registrada, georreferenciada y cruzada con planos y EETT. Sin app nueva que instalar ni capacitación en terreno. Para constructoras en Chile.',
    etiqueta: 'TERRENO POR WHATSAPP',
    h1: 'Terreno reporta por WhatsApp. La obra se ordena sola.',
    bajada: 'El capataz manda una foto o una nota de voz al número de la obra. Eso se convierte en evidencia con coordenadas, se cruza con el plano y la especificación, y si corresponde levanta una no conformidad. Sin instalar nada nuevo.',
    dolor: [
      'La información de terreno vive en grupos de WhatsApp y se pierde el lunes siguiente.',
      'Cada app nueva que se le pide al capataz termina sin usarse.',
      'La foto no dice dónde fue tomada ni contra qué especificación se compara.',
    ],
    beneficios: [
      { titulo: 'Cero capacitación', texto: 'Terreno usa la herramienta que ya usa todos los días. La curva de aprendizaje es cero porque no hay herramienta nueva.' },
      { titulo: 'Foto a evidencia técnica', texto: 'La imagen queda con coordenadas, fecha, partida asociada y descripción, dentro del expediente de la obra.' },
      { titulo: 'Cruce con el proyecto', texto: 'GO compara lo que ve con planos y EETT indexados, y responde citando la página cuando hay una desviación.' },
      { titulo: 'Nota de voz transcrita', texto: 'El capataz habla, GO transcribe y registra. En obra hablar es más rápido que escribir con guantes.' },
    ],
    chatSaludo: 'Soy GO. Cuéntame cómo reporta hoy tu gente en terreno y te muestro cómo se vería ese mismo reporte ordenado.',
    chatChips: [
      '¿Cómo conecto el WhatsApp de la obra?',
      '¿Qué pasa con una foto de una fisura?',
      '¿Funciona con notas de voz?',
    ],
    faq: [
      { p: '¿Necesitamos un número nuevo?', r: 'Se conecta un número de WhatsApp Business dedicado a la obra o a la empresa, y desde ahí el equipo de terreno interactúa con GO.' },
      { p: '¿La información queda en WhatsApp?', r: 'No. WhatsApp es solo el canal de entrada; la evidencia, las no conformidades y los documentos quedan en la plataforma, asociados al proyecto.' },
    ],
  },
};

export function jsonLdCaso(caso) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `GoConstruction OS · ${caso.etiqueta}`,
        url: `https://gobim.lat${caso.ruta}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        inLanguage: 'es-CL',
        description: caso.seoDescripcion,
        image: IMG_OG,
        offers: { '@type': 'Offer', priceCurrency: 'CLP', price: '0', description: 'Demo sin costo con obra de ejemplo cargada' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: caso.faq.map(f => ({
          '@type': 'Question',
          name: f.p,
          acceptedAnswer: { '@type': 'Answer', text: f.r },
        })),
      },
    ],
  };
}

export const OG_IMAGEN = IMG_OG;