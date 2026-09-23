import { iniciarAuditoriaGo } from './goAuditoriaTurno.ts';
import { cerrarAuditoriaGo } from './goAuditoriaCierre.ts';
import { serializarAuditoriaGo } from './goAuditoriaStore.ts';
import { invocarGoWhatsApp } from './kapsoGoNarrativa.ts';
import { enviarRespuestaKapso, GO_PHONE_NUMBER_ID } from './kapsoPuente.ts';
import { guardarAudioEntranteGo, generarRespuestaAudioGo } from './goSocraticoAudio.ts';
import { exigirReglaAplicableGo } from './goSocraticoStore.ts';

export async function ejecutarTurnoAuditadoGo(base44, entrada, grupo, sesion, entorno = 'dev') {
  return serializarAuditoriaGo(`${entorno}:${grupo}`, async () => {
    const auditoria = await iniciarAuditoriaGo(base44, entrada, grupo, sesion, entorno);
    if (auditoria.duplicado) return { ...auditoria.resultado, idempotente: true };
    try {
      if (entrada.etapa2 && entrada.aplicar_regla_id) await exigirReglaAplicableGo(base44, auditoria, entrada.aplicar_regla_id);
      let resultado = await invocarGoWhatsApp(base44, entrada, {
        pruebaId: entorno === 'dev' ? sesion : '', registroContexto: { grupoPrueba: grupo, auditoria, etapa2: entrada.etapa2 === true, entorno } });
      if (entrada.etapa2 && resultado.ruta_go === 'onboarding') {
        await guardarAudioEntranteGo(base44, auditoria, entrada);
        resultado = await generarRespuestaAudioGo(base44, auditoria, entrada, resultado);
      }
      const enviarReal = entorno === 'prod';
      const envio = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, entrada, resultado.respuesta, enviarReal, resultado.opciones);
      if (!envio.ok) throw new Error(envio.error || 'No se pudo preparar la respuesta.');
      if (envio.message_id) resultado.respuesta_message_id = envio.message_id;
      return await cerrarAuditoriaGo(base44, auditoria, resultado, envio.message_id || '');
    } catch (error) {
      await auditoria.fallar(error);
      return { ok: false, data_env: entorno, envio_whatsapp: entorno === 'prod', error: error.message,
        auditoria: { contacto: { entidad: 'ContactoAuditoriaGO', id: auditoria.persona.id },
          turno: { entidad: 'TurnoAuditoriaGO', id: auditoria.turno.id },
          eventos: (await base44.asServiceRole.entities.EventoAuditoriaGO.filter({ turno_id: auditoria.turno.id }, 'created_date', 100))
            .map(e => ({ entidad: 'EventoAuditoriaGO', id: e.id, tipo: e.tipo })) } };
    }
  });
}