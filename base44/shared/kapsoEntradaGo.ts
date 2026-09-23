// Normaliza medios para GO; jamás inventa transcripción ni presenta un archivo ausente como visto.
export async function prepararEntradaGo(base44, registro, textoElegido = '') {
  let texto = textoElegido || registro.transcripcion || registro.contenido_texto || '';
  let medio = registro.tipo_mensaje;
  const archivos = [];
  if (registro.tipo_mensaje === 'audio') {
    if (!registro.transcripcion && registro.archivo_url) {
      try {
        const transcrito = await base44.asServiceRole.integrations.Core.TranscribeAudio({ audio_url: registro.archivo_url });
        texto = typeof transcrito === 'string' ? transcrito.trim() : '';
      } catch {
        texto = '';
      }
    }
    medio = texto && (registro.transcripcion || registro.archivo_url) ? 'audio_transcrito' : 'audio_sin_transcripcion';
    if (medio === 'audio_sin_transcripcion') texto = '(audio recibido; no hay transcripción utilizable)';
  } else if (['foto', 'documento'].includes(registro.tipo_mensaje)) {
    if (registro.archivo_url) archivos.push(registro.archivo_url);
    else medio = `${registro.tipo_mensaje}_sin_archivo_accesible`;
  }
  return { texto: texto || '(mensaje multimedia recibido)', medio, archivos };
}