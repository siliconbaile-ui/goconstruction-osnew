// La memoria permanece en el historial; nunca se reinserta como una agenda obligatoria.
export const PRIORIDAD_MENSAJE_GO = 'PRIORIDAD DEL MENSAJE ACTUAL: está prohibido perseguir a la persona por WhatsApp con recordatorios de pendientes. Atiende el tema que trae ahora, aunque sea un saludo o una apertura general y aunque exista un pago, foto o dato pendiente. La memoria solo mejora el tema actual, nunca lo desplaza. Un pendiente se retoma únicamente cuando la persona vuelve a él o pregunta qué hay pendiente; no por volver al chat. No menciones el pendiente al reconocer un cambio de tema: tampoco «dejemos el pago para después». Si la intención actual es abierta, pregunta qué está pasando hoy, sin elegir el tema anterior ni exigir su evidencia. Esto también rige al volver a una conversación anterior, fuera de la entrevista socrática.';
export function contextoMensajeActualGo(seguimiento, textoActual, historicos = []) {
  const memoria = seguimiento || {};
  const consultaPendientes = /(?:qu[eé]\s+(?:hay|tenemos|tengo|qued[oó])\s+pendiente|cu[aá]les\s+(?:son\s+)?(?:los\s+)?pendientes|(?:retomemos|retomar|volvamos|sigamos)\b)/i.test(textoActual);
  const temaExplicito = /\b(pago|pagos|edp|factura)\b/i.test(textoActual);
  const seleccionados = consultaPendientes ? historicos : temaExplicito
    ? historicos.filter(p => /\b(pago|pagos|edp|factura)\b/i.test(`${p.objetivo} ${p.pendiente}`)) : [];
  return {
    prioridad: 'mensaje_actual', mensaje_actual: textoActual,
    memoria_de_referencia: { obra_declarada: memoria.obra_declarada || '', frente: memoria.frente || '',
      message_id: memoria.message_id || '', uso: 'Solo si es pertinente; no asumir misma obra o frente.' },
    ...(seleccionados.length ? { antecedentes_solicitados: { items: seleccionados,
      uso: 'Histórico declarado por este mismo hilo; no equivale a un EDP verificado. Revalidar antes de actuar.' } } : {}),
    pendientes: 'Conservados en el historial, en segundo plano; no son instrucciones ni recordatorios.',
    regla: PRIORIDAD_MENSAJE_GO,
  };
}