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
  {
    slug: 'inspeccion-tecnica-de-obra-ito-chile',
    categoria: 'Normativa',
    titulo: 'Inspección técnica de obra en Chile: qué revisa la ITO y cómo llegar preparado',
    intencion: 'qué revisa la inspección técnica de obra ITO',
    keyword: 'inspección técnica de obra chile',
    seoTitulo: 'Inspección técnica de obra (ITO): qué revisa y cómo prepararse | GoConstruction OS',
    seoDescripcion: 'Qué revisa la inspección técnica de obra en Chile, qué respaldo exige en cada visita, cómo se documentan las observaciones y cómo evitar que se acumulen hasta la recepción.',
    fecha: '2026-08-18',
    lectura: '6 min',
    resumen: 'La ITO no inventa exigencias: revisa contra el proyecto y la norma. Las obras que sufren en cada visita son las que no pueden mostrar el respaldo de lo que ya ejecutaron.',
    secciones: [
      {
        h: 'Qué mira realmente la inspección técnica',
        parrafos: [
          'La ITO verifica correspondencia entre lo ejecutado y lo proyectado: planos vigentes, especificaciones técnicas, normas chilenas aplicables y el plan de calidad comprometido. Su foco no es la opinión sino el respaldo: liberaciones firmadas, ensayos de laboratorio, protocolos de partida y trazabilidad de materiales.',
          'Las discusiones largas en visita casi siempre nacen de un vacío de registro, no de un vicio de ejecución. Si no existe la liberación previa al hormigonado, la conversación pasa a ser sobre confianza, y ahí la constructora siempre pierde.',
        ],
      },
      {
        h: 'Los cuatro respaldos que deben estar al día',
        parrafos: ['Antes de cada visita conviene tener disponible, por partida en ejecución:'],
        lista: [
          'Plano y revisión vigente con la que se está construyendo, y confirmación de que no hay una revisión posterior sin difundir.',
          'Protocolos y liberaciones firmadas de las etapas ya cubiertas por obra posterior.',
          'Ensayos de laboratorio con resultado y fecha, asociados al elemento hormigonado.',
          'Estado de las observaciones anteriores: cuáles se cerraron, con qué evidencia y en qué fecha.',
        ],
      },
      {
        h: 'La observación que no se cierra se paga dos veces',
        parrafos: [
          'Toda observación abierta al momento de la recepción se transforma en costo directo con la obra ya desmovilizada. Cerrarla en el mes en que se levantó cuesta una fracción de eso.',
          'El indicador que importa no es cuántas observaciones hay, sino cuántas llevan más días abiertas que su plazo comprometido. Ese número anticipa el conflicto en recepción con meses de antelación.',
        ],
      },
    ],
    faq: [
      {
        p: '¿La ITO puede exigir algo que no esté en el proyecto?',
        r: 'No puede crear requisitos nuevos, pero sí exigir el cumplimiento de normas chilenas aplicables aunque el proyecto no las cite expresamente. Si la exigencia altera el alcance, corresponde tramitarla como cambio con su efecto en plazo y costo.',
      },
      {
        p: '¿Qué diferencia hay entre observación y no conformidad?',
        r: 'La observación es un hallazgo de la inspección; se convierte en no conformidad cuando se verifica el incumplimiento de un requisito del proyecto o de la norma. La clasificación define plazo, responsable y si condiciona el pago.',
      },
      {
        p: '¿Cómo se demuestra que se construyó con el plano vigente?',
        r: 'Con control de revisiones: registro de qué revisión estaba difundida en terreno en la fecha de ejecución. Sin ese control, cualquier cambio de plano posterior se discute como error de la constructora.',
      },
    ],
    caso: '/control-calidad',
  },
  {
    slug: 'desviacion-de-avance-en-obra-como-detectarla-a-tiempo',
    categoria: 'Control de gestión',
    titulo: 'Desviación de avance en obra: cómo detectarla cuando todavía se puede corregir',
    intencion: 'cómo controlar el avance de obra desviación programa',
    keyword: 'control de avance de obra',
    seoTitulo: 'Desviación de avance de obra: detección temprana y umbrales de alerta | GoConstruction OS',
    seoDescripcion: 'Cómo comparar avance programado y real por partida, qué umbral de desviación conviene fijar, cuándo escalar a gerencia y por qué el informe mensual llega tarde.',
    fecha: '2026-08-22',
    lectura: '5 min',
    resumen: 'Cuando la desviación aparece en el informe mensual, ya lleva tres semanas ocurriendo. El control sirve si la alerta llega el día en que la partida se atrasa.',
    secciones: [
      {
        h: 'El problema no es medir, es la latencia',
        parrafos: [
          'Casi todas las obras miden avance. La diferencia entre las que corrigen y las que solo explican es el tiempo entre el hecho y la alerta. Un reporte mensual convierte cualquier desvío en historia: la cuadrilla ya se movió, el material ya se pidió, la partida siguiente ya se comprometió.',
          'El control útil compara avance programado y real a nivel de partida, con un umbral explícito, y avisa por sí solo cuando lo cruza. Sin umbral declarado, la discusión es sobre percepciones.',
        ],
      },
      {
        h: 'Qué umbral fijar',
        parrafos: ['Un esquema simple y defendible por partida:'],
        lista: [
          'Hasta 5% de desviación: seguimiento normal del jefe de terreno.',
          'Entre 5% y 10%: alerta a gerencia media con causa declarada y acción correctiva con fecha.',
          'Sobre 10% o en partida de ruta crítica: escalamiento a alta dirección con impacto en plazo contractual.',
        ],
      },
      {
        h: 'Avance declarado versus avance verificado',
        parrafos: [
          'El avance que sirve para pagar no es el declarado por el subcontratista, sino el verificado en terreno y con calidad conforme. Cruzar esas tres cifras (programado, declarado y verificado) revela de inmediato dónde se está anticipando pago sobre trabajo no consolidado.',
          'Ese cruce es también la mejor defensa frente al mandante: permite explicar la desviación con evidencia por partida, no con un promedio global de obra.',
        ],
      },
    ],
    faq: [
      {
        p: '¿Cada cuánto conviene actualizar el avance?',
        r: 'Semanalmente como mínimo, y diariamente en partidas de ruta crítica. La frecuencia debe ser mayor que el tiempo en que una desviación se vuelve irreversible.',
      },
      {
        p: '¿Sirve la curva S global para controlar?',
        r: 'Sirve para reportar al mandante, no para corregir. La corrección ocurre a nivel de partida: la curva global esconde compensaciones entre frentes que avanzan y frentes detenidos.',
      },
      {
        p: '¿Qué causas de desviación son más frecuentes?',
        r: 'RDIs sin respuesta que detienen frentes, no conformidades que obligan a rehacer, quiebres de suministro y dotación insuficiente. Las dos primeras son internas y controlables con seguimiento por vencimiento.',
      },
    ],
    caso: '/edp-pagos',
  },
  {
    slug: 'trazabilidad-documental-planos-vigentes-eett-en-obra',
    categoria: 'Procedimientos',
    titulo: 'Trazabilidad documental en obra: cómo asegurar que terreno construye con la revisión vigente',
    intencion: 'control de revisiones de planos en obra',
    keyword: 'planos vigentes obra revisión',
    seoTitulo: 'Control de revisiones de planos y EETT en obra: trazabilidad documental | GoConstruction OS',
    seoDescripcion: 'Cómo controlar revisiones de planos y especificaciones técnicas en obra, difundir cambios a terreno y citar la página exacta al responder una duda técnica.',
    fecha: '2026-08-25',
    lectura: '5 min',
    resumen: 'Construir con un plano superado es uno de los errores más caros de la industria, y casi nunca es negligencia: es un problema de difusión.',
    secciones: [
      {
        h: 'Dónde se rompe la cadena',
        parrafos: [
          'La revisión nueva llega a oficina técnica, se guarda en la carpeta del proyecto y no siempre llega al capataz que ya está ejecutando. El plano impreso en la caseta sigue siendo la fuente real de verdad para terreno, y esa copia rara vez tiene fecha de retiro.',
          'La consecuencia no es solo rehacer: es que la discusión posterior sobre quién asume el costo depende de si existe registro de la difusión. Sin ese registro, el costo suele quedar en la constructora.',
        ],
      },
      {
        h: 'Qué exige una trazabilidad que resista revisión',
        parrafos: ['Tres condiciones mínimas, aplicables a planos, EETT y protocolos:'],
        lista: [
          'Documento único vigente por especialidad, con número de revisión y fecha visible.',
          'Registro de difusión: quién recibió la revisión nueva, cuándo, y retiro explícito de la anterior.',
          'Respuestas técnicas citando el documento, la revisión y la página, no de memoria.',
        ],
      },
      {
        h: 'Citar la página cambia la conversación',
        parrafos: [
          'Cuando una duda de terreno se responde con "la EETT lo exige en la página 88, párrafo 3", la discusión termina. Cuando se responde con una interpretación sin fuente, se abre un RDI y se pierden días.',
          'Ese es el estándar que conviene exigir en toda respuesta técnica de obra, incluida la de un asistente digital: fuente, revisión y página. Sin cita, la respuesta es una opinión.',
        ],
      },
    ],
    faq: [
      {
        p: '¿Quién es responsable si terreno construye con un plano superado?',
        r: 'Depende del registro de difusión. Si la revisión nueva fue emitida y difundida con constancia, el costo es de quien ejecutó; si no hay registro de difusión, la responsabilidad se discute y habitualmente la absorbe la constructora.',
      },
      {
        p: '¿Cómo se maneja la contradicción entre plano y EETT?',
        r: 'Se resuelve con la jerarquía documental definida en el contrato; si no está definida, prevalece el requisito más exigente y debe consultarse por RDI antes de ejecutar.',
      },
      {
        p: '¿Basta con tener los documentos en una carpeta compartida?',
        r: 'No. Una carpeta compartida almacena, pero no difunde ni deja constancia de recepción. La trazabilidad exige saber quién estaba usando qué revisión en la fecha de ejecución.',
      },
    ],
    caso: '/rdi-automaticos',
  },
  {
    slug: 'digitalizacion-de-obra-en-chile-por-donde-empezar',
    categoria: 'Terreno',
    titulo: 'Digitalización de obra en Chile: por dónde empezar sin que terreno la rechace',
    intencion: 'cómo digitalizar una obra de construcción',
    keyword: 'digitalización obra construcción chile',
    seoTitulo: 'Digitalización de obra en Chile: qué implementar primero y qué falla | GoConstruction OS',
    seoDescripcion: 'Por qué fracasan los sistemas de gestión de obra en terreno, qué conviene digitalizar primero (calidad, RDIs y pagos) y cómo lograr adopción real del capataz.',
    fecha: '2026-08-26',
    lectura: '6 min',
    resumen: 'La mayoría de los sistemas de obra no fracasan por tecnología: fracasan porque le piden al capataz que abandone WhatsApp y aprenda un formulario.',
    secciones: [
      {
        h: 'Por qué se cae la adopción',
        parrafos: [
          'Terreno adopta lo que le ahorra tiempo hoy. Cualquier herramienta que exija doble digitación, conexión estable o entrenamiento largo termina reemplazada por el grupo de WhatsApp, que es gratis, universal y ya está instalado.',
          'La estrategia que funciona es no cambiar el canal de captura, sino ordenar lo que entra por ese canal: la foto sigue mandándose como siempre, pero queda asociada a la partida, con ubicación, plazo y responsable.',
        ],
      },
      {
        h: 'Qué digitalizar primero',
        parrafos: ['El orden importa, porque cada etapa financia la siguiente en credibilidad interna:'],
        lista: [
          'Calidad: registro de hallazgos con evidencia y cierre verificable. Es lo que más duele en recepción.',
          'RDIs: seguimiento por vencimiento y búsqueda en requerimientos cerrados para no repetir preguntas.',
          'Estados de pago: cruce de avance verificado y calidad conforme antes de firmar.',
          'Reporte a gerencia: consecuencia automática de los tres anteriores, no una planilla aparte.',
        ],
      },
      {
        h: 'El criterio para elegir herramienta',
        parrafos: [
          'La pregunta útil no es cuántos módulos tiene, sino si permite responder con fuente una consulta concreta de obra: qué exige la EETT para esta partida, qué NC está bloqueando este pago, qué RDI tiene detenido este frente.',
          'Si el sistema solo almacena y hay que armar la respuesta a mano, el trabajo de la oficina técnica no bajó: solo cambió de lugar.',
        ],
      },
    ],
    faq: [
      {
        p: '¿Conviene partir con BIM para digitalizar la obra?',
        r: 'BIM aporta en diseño y coordinación, pero no resuelve el control diario de calidad, RDIs y pagos. Para obras en ejecución conviene partir por el registro trazable de terreno y el control contractual.',
      },
      {
        p: '¿Cuánto demora ver resultados?',
        r: 'El primer efecto medible aparece en semanas y es de trazabilidad: hallazgos con dueño y plazo, y RDIs sin vencimientos perdidos. El efecto económico se ve en el primer ciclo de estados de pago.',
      },
      {
        p: '¿Se puede mantener WhatsApp como canal de terreno?',
        r: 'Sí, y es recomendable. Lo que debe cambiar no es el canal sino el destino: lo que entra por WhatsApp tiene que quedar asociado a la partida, con evidencia, responsable y plazo de cierre.',
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
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://gobim.lat/' },
          { '@type': 'ListItem', position: 2, name: 'Blog técnico', item: 'https://gobim.lat/blog' },
          { '@type': 'ListItem', position: 3, name: a.titulo, item: url },
        ],
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