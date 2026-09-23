import { iniciarAuditoriaGo } from './goAuditoriaTurno.ts';
import { cerrarAuditoriaGo } from './goAuditoriaCierre.ts';
import { serializarAuditoriaGo } from './goAuditoriaStore.ts';
import { invocarGoWhatsApp } from './kapsoGoNarrativa.ts';
import { enviarRespuestaKapso, GO_PHONE_NUMBER_ID } from './kapsoPuente.ts';

export async function ejecutarTurnoAuditadoGo(base44, entrada, grupo, sesion) {
  return serializarAuditoriaGo(`dev:${grupo}`, async () => {
    const auditoria = await iniciarAuditoriaGo(base44, entrada, grupo, sesion);
    if (auditoria.duplicado) return { ...auditoria.resultado, idempotente: true };
    try {
      const resultado = await invocarGoWhatsApp(base44, entrada, {
        pruebaId: sesion, registroContexto: { grupoPrueba: grupo, auditoria } });
      // Solo representación del payload; nunca llama a Kapso en esta ruta.
      const envio = await enviarRespuestaKapso(GO_PHONE_NUMBER_ID, entrada, resultado.respuesta, false, resultado.opciones);
      if (!envio.ok) throw new Error(envio.error || 'No se pudo representar la respuesta.');
      return await cerrarAuditoriaGo(base44, auditoria, resultado);
    } catch (error) {
      await auditoria.fallar(error);
      return { ok: false, data_env: 'dev', envio_whatsapp: false, error: error.message,
        auditoria: { contacto: { entidad: 'ContactoAuditoriaGO', id: auditoria.persona.id },
          turno: { entidad: 'TurnoAuditoriaGO', id: auditoria.turno.id },
          eventos: (await base44.entities.EventoAuditoriaGO.filter({ turno_id: auditoria.turno.id }, 'created_date', 100))
            .map(e => ({ entidad: 'EventoAuditoriaGO', id: e.id, tipo: e.tipo })) } };
    }
  });
}