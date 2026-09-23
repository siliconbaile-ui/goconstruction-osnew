import { guardarSocraticoGo, alcanceSocraticoGo } from './goSocraticoStore.ts';
import { unoAuditoriaGo } from './goAuditoriaStore.ts';
export async function guardarAudioEntranteGo(base44, auditoria, entrada) {
  if (entrada.tipo_mensaje !== 'audio') return;
  const audioRecibido = Boolean(entrada.archivo_url);
  await guardarSocraticoGo(base44, auditoria, 'evidencia', { medio: audioRecibido ? 'audio_real_transcrito' : 'audio_sin_transcripcion_utilizable', direccion: 'entrante',
    transcripcion: entrada.transcripcion || '', audio_recibido: audioRecibido, archivo_uri: entrada.archivo_url || null,
    origen: audioRecibido ? 'kapso_whatsapp' : 'sin_archivo', no_es_transcripcion_de_audio_real: !audioRecibido }, { paso: 'audio_entrada', fuente: entrada.transcripcion || entrada.contenido_texto || '' });
}
export async function generarRespuestaAudioGo(base44, auditoria, entrada, resultado) {
  const quiereVoz = entrada.tipo_mensaje === 'audio' || /(?:responde|respondeme|contesta|contestame|mandame|envia|enviame).{0,35}(?:audio|voz)/i.test((entrada.contenido_texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  if (!quiereVoz) return resultado;
  const clave = `${auditoria.turno.clave}:socratico:evidencia:audio_salida`;
  const previo = await unoAuditoriaGo(base44.asServiceRole.entities.ConocimientoObraGO, { ...alcanceSocraticoGo(auditoria), clave });
  if (previo) return { ...resultado, audio: previo.datos };
  try {
    const voz = await base44.functions.invoke('vozOrion', { texto: resultado.respuesta, voz: 'storm' });
    if (!voz.data?.audio_base64) throw new Error('El motor no devolvió audio.');
    const bytes = Uint8Array.from(atob(voz.data.audio_base64), c => c.charCodeAt(0));
    const { file_uri } = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: new File([bytes], 'go-respuesta.mp3', { type: 'audio/mpeg' }) });
    const datos = { direccion: 'saliente', archivo_uri: file_uri, mime_type: 'audio/mpeg', texto: resultado.respuesta,
      motor: voz.data.motor, generado: true, enviado: false, simulado: auditoria.simulado, nota_voz_whatsapp: false,
      pendiente: 'Conversión OGG/Opus y transporte de nota de voz no habilitados.' };
    await guardarSocraticoGo(base44, auditoria, 'evidencia', datos, { paso: 'audio_salida', fuente: resultado.respuesta });
    return { ...resultado, audio: datos };
  } catch (error) {
    await auditoria.registrar('error', { etapa: 'respuesta_audio', mensaje: error.message, enviado: false, texto_conservado: true }, 'audio_error');
    return { ...resultado, audio: { generado: false, enviado: false, simulado: auditoria.simulado, error: error.message } };
  }
}