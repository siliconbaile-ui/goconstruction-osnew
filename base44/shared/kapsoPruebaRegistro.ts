import { GO_PHONE_NUMBER_ID, normalizarMensaje, enviarRespuestaKapso } from './kapsoPuente.ts';
import { invocarGoWhatsApp } from './kapsoGoNarrativa.ts';
import { UUID_GO, firmaOpacaGo } from './kapsoRegistroBase.ts';
import { vistaPerfilDeclaradoGo } from './kapsoRegistroDatos.ts';
import { transcripcionCompletaGo } from './kapsoTranscripcionGo.ts';
import { FOTO_QA_GO } from './kapsoEscenariosGo.ts';

const CONTACTOS = { ana: '12025550101', bruno: '12025550102', carla: '12025550103' };
// El llamador exige administrador y fuerza X-Data-Env=dev. No admite números de personas reales.
export async function probarRegistroGo(base44, input) {
  const grupo = input.grupo_id || crypto.randomUUID();
  const sesion = input.sesion_id || grupo;
  const contacto = input.contacto || 'ana';
  const remitente = CONTACTOS[contacto];
  if (!UUID_GO.test(grupo) || !UUID_GO.test(sesion) || !remitente) throw new Error('Grupo, sesión o contacto sintético inválido.');
  if (input.solo_transcripcion && !input.grupo_id) throw new Error('Indica el grupo cuya transcripción quieres recuperar.');
  const clave = await firmaOpacaGo(`contacto:dev:${grupo}:${GO_PHONE_NUMBER_ID}:${remitente}`);
  const perfilFiltro = { contacto_clave: clave, entorno: 'dev', grupo_prueba: grupo };
  if (input.solo_transcripcion) {
    const filtro = { agent_name: 'orion_asistente', 'metadata.canal': 'kapso_go',
      'metadata.phone_number_id': GO_PHONE_NUMBER_ID, 'metadata.remitente': remitente,
      'metadata.prueba_id': sesion, 'metadata.registro_grupo': grupo };
    const candidatas = await base44.agents.listConversations({ q: JSON.stringify(filtro), sort: '-created_date', limit: 1 });
    const encontrada = candidatas.find(c => c.agent_name === 'orion_asistente' && c.metadata?.registro_grupo === grupo
      && c.metadata?.prueba_id === sesion && c.metadata?.remitente === remitente && c.metadata?.canal === 'kapso_go'
      && c.metadata?.phone_number_id === GO_PHONE_NUMBER_ID);
    if (!encontrada) throw new Error('No existe esa conversación de desarrollo.');
    const conversacion = await base44.agents.getConversation(encontrada.id);
    const perfil = (await base44.entities.PerfilOnboardingGO.filter(perfilFiltro, '-created_date', 1))[0] || null;
    const informe = { data_env: 'dev', grupo_id: grupo, sesion_id: sesion, contacto,
      transcripcion: transcripcionCompletaGo(conversacion), perfil, envio_whatsapp: false };
    const archivo = new File([JSON.stringify(informe, null, 2)], `go-${grupo}-${contacto}-${sesion}.json`, { type: 'application/json' });
    const subido = await base44.integrations.Core.UploadPrivateFile({ file: archivo });
    const firmado = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: subido.file_uri, expires_in: 3600 });
    return { archivo_completo: firmado.signed_url, file_uri: subido.file_uri, ...informe };
  }
  const texto = input.texto === undefined ? 'Hola GO' : input.texto;
  if (typeof texto !== 'string' || !texto.trim() || texto.length > 1800) throw new Error('Mensaje sintético vacío o demasiado largo.');
  const mensajeId = input.mensaje_id || crypto.randomUUID();
  if (!UUID_GO.test(mensajeId)) throw new Error('Identificador de mensaje inválido.');
  const seleccion = input.boton_id ? { id: String(input.boton_id), title: '' } : null;
  if (seleccion && !/^go:[^:]+:\d+$/.test(seleccion.id)) throw new Error('Botón inválido.');
  const contenido = seleccion ? { type: 'interactive', interactive: { type: 'button_reply', button_reply: seleccion } }
    : input.foto === true ? { type: 'image', caption: texto, image: { url: FOTO_QA_GO, mime_type: 'image/png' } }
    : { type: 'text', text: { body: texto } };
  const entrada = normalizarMensaje({ conversation: { id: `registro-${sesion}-${contacto}` },
    message: { id: `registro-${mensajeId}`, from: remitente, ...contenido } }, GO_PHONE_NUMBER_ID);
  const resultado = await invocarGoWhatsApp(base44, entrada, { pruebaId: sesion, registroContexto: { grupoPrueba: grupo } });
  const envio = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, entrada, resultado.respuesta, false, resultado.opciones);
  if (!envio.ok) throw new Error('No se pudo representar la respuesta en WhatsApp.');
  const perfil = (await base44.entities.PerfilOnboardingGO.filter(perfilFiltro, '-created_date', 1))[0] || null;
  return { ok: true, data_env: 'dev', envio_whatsapp: false, grupo_id: grupo, sesion_id: sesion, contacto,
    mensaje_id: mensajeId, conversation_id: resultado.agent_conversation_id, agent_message_id: resultado.agent_message_id,
    usuario: texto, go: resultado.respuesta, opciones: resultado.opciones, seguimiento: resultado.seguimiento,
    registro: resultado.perfil_contexto, perfil: vistaPerfilDeclaradoGo(perfil), herramientas: resultado.herramientas,
    metricas: { lineas: resultado.respuesta.split('\n').length, preguntas: (resultado.respuesta.match(/\?/g) || []).length,
      caracteres: resultado.respuesta.length, botones: resultado.opciones.length } };
}