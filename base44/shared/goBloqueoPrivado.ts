import { normalizarRespuestaGo } from './kapsoRegistroBase.ts';

// Control preventivo de solicitudes explícitas. No se presenta como sandbox universal del agente.
export function pideDatosPrivadosGo(texto) {
  const t = normalizarRespuestaGo(texto);
  const pedido = /\b(abre|abrir|consulta|consultar|busca|buscar|muestra|muestrame|dame|lee|leer|accede|acceder|lista|listar|trae|obten|exporta|actualiza|modifica|borra|elimina)\b/.test(t);
  const registro = /\b(pagos|edp|expediente|expedientes|rdis?|documentos|planos|contratos|presupuestos|registros|datos|base de datos|avance registrado|obras privadas|otra obra)\b/.test(t);
  const interno = /\b(privad[oa]s?|registrad[oa]s?|del invitador|quien me invito|otra obra|base de datos|del sistema|en el sistema|todas las obras|proyectoobra|estadopago)\b/.test(t);
  const permisoFalso = /\b(pase|soy administrador|soy admin|me invitaron|tengo permiso)\b/.test(t);
  return (pedido && registro) || (registro && interno) || (permisoFalso && pedido && interno);
}
export async function bloquearConsultaGo(auditoria) {
  await auditoria.registrar('acceso_bloqueado', { motivo: 'sin_autorizacion_verificada', etapa: 'antes_de_invocar_agente',
    agente_invocado: false, consulta_privada_ejecutada: false });
  return { agente: null, origen: 'control_acceso', agent_conversation_id: null, agent_message_id: null, herramientas: [], opciones: [],
    respuesta: 'El Pase de Obra no autoriza acceso a registros privados; falta verificar tu autorización.\n¿Qué evidencia puedes compartir aquí para revisar el caso?',
    seguimiento: { estado: 'acceso_pendiente', tipo: 'contexto_declarado_no_autorizacion', pendiente: 'Autorización verificada por el administrador' },
    perfil_contexto: { identidad_verificada: false, acceso_privado: false, bloqueo_previo: true } };
}