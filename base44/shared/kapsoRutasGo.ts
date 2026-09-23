import { entradaHistorialGo, normalizarRespuestaGo } from './kapsoRegistroBase.ts';

export const DEMO_PLATAFORMA_GO = 'https://whatsapptobim.base44.app/demo';

function rutaAnteriorGo(conversacion) {
  for (const mensaje of [...(conversacion.messages || [])].reverse()) {
    if (mensaje.role !== 'user' || !mensaje.content?.includes('[kapso_message_id:')) continue;
    const entrada = entradaHistorialGo(mensaje);
    if (entrada?.ruta_go) return entrada.ruta_go;
    if (entrada?.registro_contexto) return 'onboarding'; // hilos anteriores a las rutas
  }
  return '';
}

export function resolverRutaGo(conversacion, texto, esPrimero) {
  const t = normalizarRespuestaGo(texto);
  if (/\b(iniciar|empezar|comenzar|hacer|seguir|continuar) (el |mi |con el )?onboarding\b|\b(quiero registrarme|crear mi perfil)\b/.test(t)) return 'onboarding';
  if (/\b(ver|mostrar|quiero|hacer|iniciar|seguir|continuar) (el |un |con el )?(recorrido|demo|demostracion)\b|\bcomo funciona\b|\bver plataforma\b/.test(t)) return 'demo';
  const anterior = rutaAnteriorGo(conversacion);
  if (anterior === 'inicio') return /^(si|claro|dale|muestrame|quiero verlo)$/.test(t) ? 'demo' : 'libre';
  if (anterior) return anterior;
  if (esPrimero && (/^(hola|hola go|buenas|buen dia|buenas tardes|buenas noches|hi|hey)\b/.test(t) || /quiero conversar sobre una obra y resolver lo mas urgente/.test(t) || !t)) return 'inicio';
  return 'libre';
}

export async function contextoDemostracionGo(base44) {
  const proyectos = await base44.asServiceRole.entities.ProyectoObra.filter({ codigo: 'BES-2026-01', es_demo: true }, '-created_date', 1);
  const proyecto = proyectos[0];
  if (!proyecto) return { disponible: false, enlace_publico: DEMO_PLATAFORMA_GO };
  const q = { proyecto_id: proyecto.id };
  const [partidas, edps, inspecciones, rdis] = await Promise.all([
    base44.asServiceRole.entities.PartidaControl.filter(q, 'codigo', 30),
    base44.asServiceRole.entities.EstadoPago.filter(q, '-created_date', 30),
    base44.asServiceRole.entities.InspeccionCalidad.filter(q, '-created_date', 30),
    base44.asServiceRole.entities.RequerimientoInformacion.filter(q, '-created_date', 30),
  ]);
  const bloqueados = edps.filter(e => e.estado === 'bloqueado_calidad');
  const programado = Number(proyecto.avance_programado), real = Number(proyecto.avance_real);
  return {
    disponible: true, etiqueta: 'OBRA DEMO · datos curados, solo lectura', codigo: proyecto.codigo,
    nombre: proyecto.nombre, avance_real: Number.isFinite(real) ? real : null,
    avance_programado: Number.isFinite(programado) ? programado : null,
    brecha_puntos: Number.isFinite(real) && Number.isFinite(programado) ? Number((programado - real).toFixed(2)) : null,
    partidas: partidas.slice(0, 8).map(p => ({ codigo: p.codigo, nombre: p.nombre, real: p.avance_real, programado: p.avance_programado, calidad: p.estado_calidad, pago: p.estado_pago })),
    edps_bloqueados: bloqueados.length,
    monto_bloqueado_usd: bloqueados.reduce((s, e) => s + (Number(e.monto_usd) || 0), 0),
    motivos_bloqueo: bloqueados.slice(0, 3).map(e => ({ edp: e.numero_edp, motivo: e.motivo_bloqueo || 'sin motivo consignado' })),
    nc_abiertas: inspecciones.filter(i => i.es_no_conformidad && ['abierta', 'en_revision'].includes(i.estado)).length,
    rdis_pendientes: rdis.filter(r => ['abierto', 'en_revision', 'vencido'].includes(r.estado)).length,
    enlace_publico: DEMO_PLATAFORMA_GO,
  };
}

export function instruccionesRutaGo(ruta, datosDemo, primerTurno) {
  if (ruta === 'inicio') return `PUERTA DE DOS CAMINOS: este es el primer contacto genérico. Presenta a GO como jefe técnico digital en una frase y pregunta «¿Quieres ver cómo funciona GO?». Ofrece EXACTAMENTE dos botones: {"titulo":"Ver recorrido","opcion":"Quiero ver el recorrido interactivo de GO con la obra de demostración en WhatsApp y la plataforma"} y {"titulo":"Iniciar onboarding","opcion":"Quiero iniciar el onboarding conversacional con GO"}. No solicites datos personales ni consentimiento todavía. No consultes herramientas.`;
  if (ruta === 'demo') return `RECORRIDO INTERACTIVO GO, NO ONBOARDING. Eres el GO técnico completo de la plataforma: usa criterio, cálculo y explicación de avances, calidad, RDIs y pagos con SOLO este snapshot público curado: ${JSON.stringify(datosDemo)}. No invoques herramientas ni entidades en esta ruta. Nunca presentes cifras demo como datos del interlocutor. Si no hay snapshot disponible, no inventes cifras: propón un ejercicio numérico explícitamente hipotético. Responde la pregunta concreta con fórmula, entradas, unidades, resultado y límite; brecha de avance = programado - real en puntos porcentuales. Si es el primer paso del recorrido, muestra un cálculo breve real del snapshot (si disponible) y ofrece tres botones «Ver avance», «Calidad y pagos», «Ver plataforma», cada opción describiendo su intención específica. Si elige plataforma, entrega literalmente ${DEMO_PLATAFORMA_GO} (vista pública de solo lectura), explica que el recorrido guiado del Centro de Comando se inicia al entrar a la app, y no afirmes que abrir el enlace ya inició un tour. Para otros turnos ofrece hasta tres opciones pertinentes, incluida «Iniciar onboarding» solo si aporta. Responde también a texto, foto y audio libres sin perder el hilo. No pidas perfil, consentimiento, nombre, empresa ni cargo por iniciativa propia. No prometas escrituras o lectura de obras privadas. Máximo 360 caracteres, 3 líneas y una pregunta en cuerpo; botones aparte. ${primerTurno ? 'Es primer contacto: introduce brevemente GO y la obra demo sin diluir el cálculo.' : ''}`;
  if (ruta === 'onboarding') return 'ONBOARDING ELEGIDO EXPRESAMENTE: sigue el registro conversacional, consentimiento y Pase de Obra gestionados por el adaptador; nunca lo conviertas en requisito para recibir ayuda. Conserva tus capacidades de análisis técnico dentro del alcance autorizado.';
  return 'CONSULTA TÉCNICA LIBRE: responde como GO de la plataforma con cálculos y criterio técnico a partir de lo compartido por el interlocutor; no inicies onboarding ni pidas datos de perfil salvo solicitud expresa. Si pide ver una demo o iniciar onboarding, cambia de camino en el turno correspondiente. Sin acceso a obras privadas.';
}