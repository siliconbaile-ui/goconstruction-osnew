import { GO_PHONE_NUMBER_ID, normalizarMensaje } from './kapsoPuente.ts';
import { UUID_GO, firmaOpacaGo } from './kapsoRegistroBase.ts';
import { vistaPerfilDeclaradoGo } from './kapsoRegistroDatos.ts';
import { ejecutarTurnoAuditadoGo } from './goTurnoAuditado.ts';
import { exportarAuditoriaGo } from './goAuditoriaReporte.ts';
import { FOTO_QA_GO } from './kapsoEscenariosGo.ts';
import { ErrorEntradaRegistroGo } from './goErrorEntrada.ts';

const CONTACTOS = { ana: '12025550101', bruno: '12025550102', carla: '12025550103' };
export async function probarRegistroGo(base44, input) {
  const grupo = input.grupo_id || crypto.randomUUID();
  const sesion = input.sesion_id || grupo;
  const contacto = input.contacto || 'ana';
  const remitente = CONTACTOS[contacto];
  if (!UUID_GO.test(grupo) || !UUID_GO.test(sesion) || !remitente) throw new ErrorEntradaRegistroGo('Grupo, sesión o contacto sintético inválido.');
  if (input.solo_transcripcion && !input.grupo_id) throw new ErrorEntradaRegistroGo('Indica el grupo cuya transcripción quieres recuperar.');
  const clave = await firmaOpacaGo(`contacto:dev:${grupo}:${GO_PHONE_NUMBER_ID}:${remitente}`);
  const perfilFiltro = { contacto_clave: clave, entorno: 'dev', grupo_prueba: grupo };
  if (input.solo_transcripcion) return exportarAuditoriaGo(base44, grupo, input.sesion_id || '', 'dev');
  const texto = input.texto === undefined ? 'Hola GO' : input.texto;
  if (typeof texto !== 'string' || !texto.trim() || texto.length > 1800) throw new ErrorEntradaRegistroGo('Mensaje sintético vacío o demasiado largo.');
  const mensajeId = input.mensaje_id || crypto.randomUUID();
  if (!UUID_GO.test(mensajeId)) throw new ErrorEntradaRegistroGo('Identificador de mensaje inválido.');
  const wamid = input.wamid || `wamid.TEST.${mensajeId}`;
  if (!/^wamid\.TEST\.[a-f0-9-]{36}$/i.test(wamid)) throw new ErrorEntradaRegistroGo('Solo se aceptan wamid sintéticos en desarrollo.');
  const seleccion = input.boton_id ? { id: String(input.boton_id), title: '' } : null;
  if (seleccion && !/^go:[^:]+:\d+$/.test(seleccion.id)) throw new ErrorEntradaRegistroGo('Botón inválido.');
  if (input.etapa !== undefined && ![1, 2].includes(input.etapa)) throw new ErrorEntradaRegistroGo('Etapa inválida.');
  if (input.audio_simulado && (input.etapa !== 2 || seleccion || input.foto)) throw new ErrorEntradaRegistroGo('Audio simulado requiere etapa 2 y un solo tipo de entrada.');
  if (input.aplicar_regla_id && (input.etapa !== 2 || !/^[a-f0-9]{24}$/i.test(input.aplicar_regla_id))) throw new ErrorEntradaRegistroGo('Referencia de regla inválida.');
  const contenido = seleccion ? { type: 'interactive', interactive: { type: 'button_reply', button_reply: seleccion } }
    : input.audio_simulado === true ? { type: 'audio', kapso: { transcript: texto } }
    : input.foto === true ? { type: 'image', caption: texto, image: { url: FOTO_QA_GO, mime_type: 'image/png' } }
    : { type: 'text', text: { body: texto } };
  const entrada = normalizarMensaje({ conversation: { id: `registro-${sesion}-${contacto}` },
    message: { id: wamid, from: remitente, ...contenido, timestamp: input.timestamp || new Date().toISOString() } }, GO_PHONE_NUMBER_ID);
  if (!entrada) throw new ErrorEntradaRegistroGo('Entrada o timestamp inválidos.');
  if (input.etapa === 2) { entrada.etapa2 = true; entrada.aplicar_regla_id = input.aplicar_regla_id || ''; }
  const resultado = await ejecutarTurnoAuditadoGo(base44, entrada, grupo, sesion, 'dev');
  if (resultado.ok === false) return { ...resultado, grupo_id: grupo, sesion_id: sesion, contacto, wamid };
  const perfil = (await base44.entities.PerfilOnboardingGO.filter(perfilFiltro, '-created_date', 1))[0] || null;
  return { ok: true, data_env: 'dev', envio_whatsapp: false, grupo_id: grupo, sesion_id: sesion, contacto,
    mensaje_id: mensajeId, conversation_id: resultado.agent_conversation_id, agent_message_id: resultado.agent_message_id,
    usuario: entrada.transcripcion || entrada.contenido_texto, go: resultado.respuesta, opciones: resultado.opciones, seguimiento: resultado.seguimiento,
    ...(resultado.socratico ? { socratico: resultado.socratico } : {}), ...(resultado.audio ? { audio: resultado.audio } : {}),
    registro: resultado.perfil_contexto, perfil: vistaPerfilDeclaradoGo(perfil), herramientas: resultado.herramientas,
    auditoria: resultado.auditoria, wamid_entrada: resultado.wamid_entrada, wamid_salida: resultado.wamid_salida,
    timestamp_salida: resultado.timestamp_salida, idempotente: resultado.idempotente || false,
    origen: resultado.origen || 'orion_asistente',
    metricas: { lineas: resultado.respuesta.split('\n').length, preguntas: (resultado.respuesta.match(/\?/g) || []).length,
      caracteres: resultado.respuesta.length, botones: resultado.opciones.length } };
}