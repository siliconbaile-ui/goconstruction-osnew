// El agente emite varios mensajes seguidos mientras piensa: uno por cada
// tanda de herramientas y otro con el texto final. En pantalla eso se veía
// como cinco burbujas "ORION · Read DocumentoTecnico · Listo" repetidas.
// Aquí se colapsan en una sola burbuja por turno, sin herramientas duplicadas.
export default function agruparMensajes(messages = []) {
  const out = [];

  for (const m of messages) {
    const previo = out[out.length - 1];
    const mismoTurno = previo && previo.role !== 'user' && m.role !== 'user';

    if (!mismoTurno) {
      out.push({ ...m, tool_calls: [...(m.tool_calls || [])] });
      continue;
    }

    // Herramientas: la última versión de cada llamada manda (pendiente → listo).
    const clave = tc => `${tc.name}|${tc.arguments_string || ''}`;
    const mapa = new Map(previo.tool_calls.map(tc => [clave(tc), tc]));
    for (const tc of m.tool_calls || []) mapa.set(clave(tc), tc);

    previo.tool_calls = Array.from(mapa.values());
    previo.id = m.id || previo.id;
    if (m.content) {
      previo.content = previo.content ? `${previo.content}\n\n${m.content}` : m.content;
    }
    if (m.file_urls?.length) {
      previo.file_urls = [...(previo.file_urls || []), ...m.file_urls];
    }
  }

  return out;
}