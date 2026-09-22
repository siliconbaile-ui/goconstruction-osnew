// Contrato de presentación del canal; no invoca modelos ni reemplaza al agente GO.
export function interpretarSalidaGo(texto) {
  const limpio = texto.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const salida = JSON.parse(limpio);
  if (typeof salida.cuerpo !== 'string' || !salida.cuerpo.trim() || salida.cuerpo.length > 1024)
    throw new Error('GO debe entregar un cuerpo breve de hasta 1024 caracteres.');
  if (!Array.isArray(salida.opciones) || salida.opciones.length > 10)
    throw new Error('GO debe entregar entre cero y diez opciones.');
  const maxTitulo = salida.opciones.length <= 3 ? 20 : 24;
  const titulos = new Set();
  for (const opcion of salida.opciones) {
    if (typeof opcion.titulo !== 'string' || !opcion.titulo.trim() || opcion.titulo.length > maxTitulo
      || typeof opcion.opcion !== 'string' || !opcion.opcion.trim() || opcion.opcion.length > 1000
      || titulos.has(opcion.titulo.trim())) throw new Error('Opción de GO inválida para WhatsApp.');
    titulos.add(opcion.titulo.trim());
  }
  return { cuerpo: salida.cuerpo.trim(), opciones: salida.opciones };
}

export function resolverSeleccionGo(conversacion, seleccion) {
  const coincidencia = /^go:([^:]+):(\d+)$/.exec(seleccion.id);
  if (!coincidencia) throw new Error('Identificador de opción GO inválido.');
  const origen = (conversacion.messages || []).find(m => m.role === 'assistant' && m.id === coincidencia[1]);
  if (!origen) throw new Error('La opción no pertenece a esta conversación de GO.');
  const opcion = interpretarSalidaGo(origen.content).opciones[Number(coincidencia[2])];
  if (!opcion) throw new Error('La opción elegida no existe en el mensaje original.');
  // El significado procede del mensaje original del agente, no del título recibido.
  return `Opción elegida: ${opcion.titulo}. ${opcion.opcion}`;
}

export function construirSalidaKapso(phone, texto, opciones = []) {
  const base = { messaging_product: 'whatsapp', recipient_type: 'individual', to: phone };
  if (!opciones.length) return { ...base, type: 'text', text: { body: texto.slice(0, 4000) } };
  if (!texto.trim() || texto.length > 1024 || opciones.length > 10)
    throw new Error('Mensaje interactivo fuera de los límites de WhatsApp.');
  const esBoton = opciones.length <= 3;
  const ids = new Set();
  const titulos = new Set();
  const rows = opciones.map(opcion => {
    const { id, title } = opcion;
    if (typeof id !== 'string' || !id || id.length > 200 || ids.has(id)
      || typeof title !== 'string' || !title.trim() || title.length > (esBoton ? 20 : 24) || titulos.has(title))
      throw new Error('Identificador o título interactivo inválido.');
    ids.add(id); titulos.add(title);
    return { id, title };
  });
  const action = esBoton
    ? { buttons: rows.map(reply => ({ type: 'reply', reply })) }
    : { button: 'Ver opciones', sections: [{ title: 'Próximo paso', rows }] };
  return { ...base, type: 'interactive', interactive: {
    type: esBoton ? 'button' : 'list', body: { text: texto }, action,
  } };
}