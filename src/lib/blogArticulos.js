export const OG_IMAGEN = 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/08dbc115f_generated_image.png';

// Blog técnico: cada artículo apunta a una intención de búsqueda real de obra
// en Chile (norma, plazo, procedimiento) y cierra en el caso de uso que resuelve.
// `intencion` documenta la consulta objetivo para no canibalizar keywords.
export const ARTICULOS = [
  {
    slug: 'nch-430-recubrimiento-minimo-hormigon-armado',
    categoria: 'Normativa',
    titulo: 'Recubrimiento mínimo de armaduras según NCh 430: qué exige y cómo verificarlo en obra',
    intencion: 'recubrimiento mínimo NCh 430 hormigón armado',
    keyword: 'nch 430 recubrimiento',
    seoTitulo: 'Recubrimiento mínimo NCh 430: exigencias y verificación en obra | GoConstruction OS',
    seoDescripcion: 'Qué exige la NCh 430 en recubrimiento de armaduras, cómo se verifica antes del hormigonado y qué hacer si la inspección detecta recubrimiento insuficiente en una losa o muro.',
    fecha: '2026-08-12',
    lectura: '7 min',
    resumen: 'El recubrimiento es la primera línea de defensa contra la corrosión de armaduras. Es también una de las no conformidades más caras de corregir, porque casi siempre se detecta cuando el hormigón ya está colocado.',
    secciones: [
      {
        h: 'Qué regula la NCh 430 respecto del recubrimiento',
        parrafos: [
          'La NCh 430 (hormigón armado, requisitos de diseño y cálculo, basada en ACI 318) fija recubrimientos mínimos según el elemento estructural y la exposición ambiental. El recubrimiento no es un detalle de terminación: define la protección alcalina del acero y la resistencia al fuego del elemento.',
          'En obra, el valor aplicable no sale solo de la norma: sale del cruce entre la NCh 430, las especificaciones técnicas del proyecto y las notas de los planos de estructura. Cuando los tres difieren, manda el más exigente, y eso debe quedar escrito antes de hormigonar, no discutido después.',
        ],
      },
      {
        h: 'Los tres errores que producen recubrimiento insuficiente',
        parrafos: ['La mayoría de las no conformidades de recubrimiento no vienen del diseño, sino de la ejecución:'],
        lista: [
          'Separadores insuficientes, mal distribuidos o de altura equivocada para la malla que sostienen.',
          'Tránsito de personal sobre la enfierradura de losa antes del hormigonado, que hunde la malla superior.',
          'Interferencias de instalaciones (conduits, pasadas sanitarias) resueltas en terreno desplazando armadura sin consultar al proyectista.',
        ],
      },
      {
        h: 'Cómo verificarlo antes de hormigonar',
        parrafos: [
          'La verificación útil es la que ocurre en la liberación previa al hormigonado, con registro: medición del recubrimiento en puntos definidos, fotografía de la enfierradura con separadores visibles y firma del responsable. Después del hormigonado solo queda el escáner de armaduras, y la corrección ya implica demolición parcial o refuerzo aprobado por el calculista.',
          'Cada medición debe quedar asociada a la partida y al elemento, no a un correo. Si el registro no permite responder "qué recubrimiento tenía el eje 7 del nivel 3 el día que se hormigonó", ese registro no sirve como respaldo técnico ni contractual.',
        ],
      },
      {
        h: 'Qué hacer si la NC ya está levantada',
        parrafos: [
          'Una no conformidad crítica de recubrimiento tiene tres salidas: aceptación fundada del proyectista, refuerzo o reparación con procedimiento aprobado, o rechazo del elemento. Las tres exigen respaldo escrito con cita de la norma y de la EETT, y todas afectan plazo y costo.',
          'El control efectivo es contractual: mientras la NC crítica esté abierta, el estado de pago de esa partida no debe avanzar. Ese es el único mecanismo que alinea al subcontratista con la calidad ejecutada.',
        ],
      },
    ],
    faq: [
      {
        p: '¿El recubrimiento se mide al fierro principal o al estribo?',
        r: 'Se mide a la superficie de la armadura más externa, normalmente el estribo o la malla de reparto. Es un error frecuente medir al fierro principal y declarar conformidad con menos recubrimiento real del exigido.',
      },
      {
        p: '¿Quién autoriza aceptar un recubrimiento menor al especificado?',
        r: 'Solo el proyectista estructural, por escrito, mediante respuesta a un requerimiento de información. Ni la inspección técnica ni la constructora pueden aceptar por sí solas una desviación de un requisito normativo.',
      },
      {
        p: '¿Cómo se demuestra el recubrimiento después de hormigonar?',
        r: 'Con escáner de armaduras o pachómetro sobre una grilla de medición, informe firmado por laboratorio y trazabilidad de la ubicación exacta medida. Sin coordenadas ni referencia al elemento, el informe pierde valor probatorio.',
      },
    ],
    caso: '/control-calidad',
  },
  {
    slug: 'como-redactar-un-rdi-en-obra',
    categoria: 'Procedimientos',
    titulo: 'Cómo redactar un RDI en obra que se responda rápido (y no se conteste con otra pregunta)',
    intencion: 'cómo redactar un RDI en obra plantilla',
    keyword: 'rdi obra chile',
    seoTitulo: 'Cómo redactar un RDI en obra: estructura, plazos y errores frecuentes | GoConstruction OS',
    seoDescripcion: 'Estructura de un requerimiento de información bien planteado, plazos de respuesta, cómo citar planos y EETT, y por qué la mitad de los RDIs de una obra son redundantes.',
    fecha: '2026-08-05',
    lectura: '6 min',
    resumen: 'Un RDI mal redactado se responde en tres semanas y con otra pregunta. Uno bien redactado se responde en dos días, porque el proyectista solo tiene que decir sí o no a una alternativa fundada.',
    secciones: [
      {
        h: 'La estructura mínima de un RDI útil',
        parrafos: ['Un requerimiento de información que se responde rápido contiene siempre cinco elementos:'],
        lista: [
          'Ubicación exacta: partida, eje, nivel y, si aplica, coordenadas de la evidencia fotográfica.',
          'Cita del documento que genera la duda: plano con número y revisión, o EETT con página y párrafo.',
          'La contradicción o vacío concreto, en una frase, sin relato de antecedentes.',
          'La alternativa que propone la constructora, con su fundamento técnico.',
          'El impacto en plazo y costo si la respuesta no llega en la fecha solicitada.',
        ],
      },
      {
        h: 'Por qué los plazos se incumplen',
        parrafos: [
          'El plazo contractual de respuesta empieza a correr cuando el RDI está bien planteado. Un requerimiento sin cita ni ubicación se devuelve, y ese ida y vuelta no se registra como demora del proyectista: se registra como demora de la obra.',
          'El seguimiento debe ser por vencimiento, no por bandeja de entrada. Un RDI vencido que detiene una partida es una alerta de gerencia, no un correo pendiente de alguien.',
        ],
      },
      {
        h: 'El problema silencioso: RDIs redundantes',
        parrafos: [
          'En obras con varios frentes es habitual que una duda ya resuelta se vuelva a emitir meses después, porque quien la plantea no participó en el ciclo anterior. Cada RDI redundante consume horas de la oficina técnica y del proyectista, y contamina el historial del proyecto.',
          'La defensa es buscar en los requerimientos cerrados antes de emitir. Si la respuesta existe, corresponde citarla y difundirla, no volver a preguntar.',
        ],
      },
    ],
    faq: [
      {
        p: '¿Cuál es el plazo típico de respuesta de un RDI en Chile?',
        r: 'Lo fija el contrato de construcción, habitualmente entre 5 y 10 días hábiles. Lo determinante es desde cuándo se cuenta: el plazo corre desde la recepción de un requerimiento completo y bien fundado.',
      },
      {
        p: '¿Un RDI puede reemplazar una modificación de proyecto?',
        r: 'No. El RDI aclara o interpreta; si la respuesta cambia el alcance, debe traducirse en un plano de revisión nueva o en una orden de cambio con su efecto en plazo y precio.',
      },
      {
        p: '¿Quién debe firmar un RDI?',
        r: 'Lo emite la constructora a través de su oficina técnica o administrador de obra, y se dirige al proyectista de la especialidad con copia a la inspección técnica. Un RDI emitido informalmente por un capataz no tiene efecto contractual.',
      },
    ],
    caso: '/rdi-automaticos',
  },
  {
    slug: 'no-quality-no-pay-estado-de-pago-subcontratista',
    categoria: 'Control de gestión',
    titulo: 'No quality, no pay: cómo condicionar el estado de pago del subcontratista a la calidad ejecutada',
    intencion: 'cómo revisar estado de pago subcontratista obra',
    keyword: 'estado de pago obra calidad',
    seoTitulo: 'Estado de pago y calidad: cómo aplicar no quality, no pay en obra | GoConstruction OS',
    seoDescripcion: 'Cómo verificar avance y calidad antes de firmar un estado de pago, qué respaldo exige retener y cómo evitar pagar partidas con no conformidades críticas abiertas.',
    fecha: '2026-07-28',
    lectura: '6 min',
    resumen: 'El avance se paga cuando está ejecutado, no cuando está declarado. La diferencia entre ambas cosas es todo el margen de la obra.',
    secciones: [
      {
        h: 'Las dos verificaciones que casi nunca se cruzan',
        parrafos: [
          'Un estado de pago requiere dos comprobaciones independientes: que el avance físico declarado exista, y que lo ejecutado cumpla la especificación. En la práctica se revisa la primera y se asume la segunda, porque viven en sistemas distintos: la cubicación en la planilla del administrador, la calidad en los protocolos del inspector.',
          'Cuando se pagan partidas con no conformidades críticas abiertas, la constructora pierde su única palanca real de corrección: después de pagado, la reparación depende de la buena voluntad del subcontratista.',
        ],
      },
      {
        h: 'Qué debe respaldar la retención',
        parrafos: ['Retener sin respaldo genera conflicto contractual. Una retención defendible incluye:'],
        lista: [
          'Identificación de la no conformidad, con la partida y el elemento afectado.',
          'Cita del requisito incumplido: norma chilena aplicable, EETT o plano.',
          'Evidencia fotográfica fechada y ubicada, más el plazo de cierre notificado.',
          'El monto retenido y su relación con la partida observada, no con el total del estado de pago.',
        ],
      },
      {
        h: 'Cómo se libera el pago',
        parrafos: [
          'El pago se libera con evidencia de cierre, no con una promesa: reparación ejecutada, verificación del inspector y registro del cierre. Ese ciclo debe ser rápido, porque una retención mal gestionada frena al subcontratista y termina afectando el programa de la propia obra.',
          'La regla operativa es simple: avance verificado más calidad verificada habilita firma. Si falta una de las dos, el estado de pago queda retenido con motivo escrito y visible para todos los involucrados.',
        ],
      },
    ],
    faq: [
      {
        p: '¿Se puede retener el estado de pago completo por una NC en una partida?',
        r: 'Lo razonable y defendible es retener el monto de la partida observada, no el total. La retención debe ser proporcional al incumplimiento y estar fundada en el contrato.',
      },
      {
        p: '¿Qué pasa si el subcontratista repara pero no hay registro?',
        r: 'Sin evidencia de cierre la no conformidad sigue abierta a efectos de respaldo. Toda reparación debe cerrarse con fotografía y verificación del inspector, o reaparecerá en la recepción final.',
      },
      {
        p: '¿Cómo se documenta esto ante el mandante?',
        r: 'Con la trazabilidad completa del ciclo: NC levantada, requisito citado, monto retenido, reparación y cierre verificado. Esa cadena es la que sostiene el estado de pago frente a una revisión de la inspección técnica.',
      },
    ],
    caso: '/edp-pagos',
  },
  {
    slug: 'registro-de-inspeccion-en-terreno-fotografia-trazabilidad',
    categoria: 'Terreno',
    titulo: 'Registro de inspección en terreno: cómo convertir la foto de WhatsApp en evidencia con valor técnico',
    intencion: 'cómo registrar inspecciones de calidad en obra',
    keyword: 'registro inspección calidad obra',
    seoTitulo: 'Registro de inspecciones en terreno: de la foto de WhatsApp a la evidencia trazable | GoConstruction OS',
    seoDescripcion: 'Cómo estructurar el registro de inspecciones y no conformidades en obra: qué datos debe tener una fotografía para servir como evidencia, ubicación, plazos y cierre.',
    fecha: '2026-07-20',
    lectura: '5 min',
    resumen: 'La obra ya documenta todo por WhatsApp. El problema no es la captura, es que esa evidencia no se puede recuperar tres meses después cuando alguien pregunta qué pasó en el eje 7.',
    secciones: [
      {
        h: 'Qué convierte una foto en evidencia',
        parrafos: ['Una imagen suelta en un grupo de WhatsApp no es evidencia técnica. Para tener valor necesita cuatro atributos:'],
        lista: [
          'Fecha y hora de captura, no de reenvío.',
          'Ubicación: partida, eje, nivel y, si es posible, coordenadas con su precisión.',
          'El requisito contra el que se compara: plano, EETT o norma, con página.',
          'Responsable de cierre y plazo, para que el hallazgo tenga dueño.',
        ],
      },
      {
        h: 'La gravedad define el flujo, no el criterio del momento',
        parrafos: [
          'Clasificar el hallazgo como leve, moderado o crítico no es un adorno: define quién se entera, en qué plazo debe cerrarse y si bloquea el pago de la partida. Sin esa clasificación, todos los hallazgos compiten por la misma atención y los críticos se diluyen.',
          'Un hallazgo crítico debe escalar por sí solo cuando no hay respuesta. Si depende de que alguien recuerde revisar la lista, no es un sistema de control.',
        ],
      },
      {
        h: 'El cierre es la parte que se olvida',
        parrafos: [
          'La mayoría de los sistemas de calidad en obra registran bien la apertura y mal el cierre. Sin evidencia de cierre no hay forma de demostrar en la recepción final que el hallazgo fue resuelto, y la observación vuelve con costo multiplicado.',
          'La regla es que cada hallazgo se cierre con la misma calidad de registro con que se abrió: fotografía de la corrección, verificación del inspector y fecha real de cierre.',
        ],
      },
    ],
    faq: [
      {
        p: '¿Sirve el grupo de WhatsApp como registro de calidad?',
        r: 'Sirve como canal de captura, porque es donde la gente de terreno ya está. No sirve como registro, porque no es recuperable ni trazable: la evidencia debe quedar asociada a la partida y al hallazgo.',
      },
      {
        p: '¿Toda observación de calidad es una no conformidad?',
        r: 'No. Una observación pasa a no conformidad cuando incumple un requisito verificable del proyecto o de la norma. Esa distinción evita inflar el registro y perder foco en lo crítico.',
      },
      {
        p: '¿Qué plazo de cierre corresponde a un hallazgo crítico?',
        r: 'Lo define el plan de calidad de la obra, pero en la práctica un hallazgo crítico exige plazo corto y escalamiento automático si no hay respuesta, porque suele condicionar partidas siguientes y el pago.',
      },
    ],
    caso: '/whatsapp-bim',
  },
];

export const porSlug = (slug) => ARTICULOS.find(a => a.slug === slug);

export function jsonLdArticulo(a) {
  const url = `https://gobim.lat/blog/${a.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: a.titulo,
        description: a.seoDescripcion,
        datePublished: a.fecha,
        dateModified: a.fecha,
        inLanguage: 'es-CL',
        mainEntityOfPage: url,
        image: OG_IMAGEN,
        author: { '@type': 'Organization', name: 'B2Bytes · GoConstruction OS' },
        publisher: { '@type': 'Organization', name: 'GoConstruction OS', url: 'https://gobim.lat' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: a.faq.map(f => ({
          '@type': 'Question',
          name: f.p,
          acceptedAnswer: { '@type': 'Answer', text: f.r },
        })),
      },
    ],
  };
}