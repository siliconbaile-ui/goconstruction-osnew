import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { automatizacionPermitida } from '../../shared/gobernanza.ts';

const ESCALATION_CHAIN = {
  jefe_terreno: 'gerencia_media',
  gerencia_media: 'alta_direccion',
  alta_direccion: 'administrador',
  administrador: 'administrador',
};

const HOURS_THRESHOLD = 24;

function hoursSince(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return (Date.now() - d.getTime()) / 36e5;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Active or acknowledged alerts, critical level, not yet escalated
    const candidates = await base44.asServiceRole.entities.AlertaSistema.filter({
      estado: { $in: ['activa', 'reconocida'] },
      nivel: 'critica',
      escalada: false,
    }, '-created_date', 200);

    const toEscalate = candidates.filter((a) => {
      const hours = a.horas_sin_respuesta && a.horas_sin_respuesta > 0
        ? a.horas_sin_respuesta
        : hoursSince(a.created_date);
      return hours >= HOURS_THRESHOLD;
    });

    const escalated = [];
    let omitidos = 0;
    for (const alert of toEscalate) {
      // G1 · no se escala nada de un proyecto demo, pausado o en configuración
      const permiso = await automatizacionPermitida(base44, alert.proyecto_id);
      if (!permiso.permitida) { omitidos++; continue; }

      const newRol = ESCALATION_CHAIN[alert.destinatario_rol] || 'gerencia_media';
      const hours = alert.horas_sin_respuesta && alert.horas_sin_respuesta > 0
        ? alert.horas_sin_respuesta
        : hoursSince(alert.created_date);

      // Mark original as escalated and bump recipient
      await base44.asServiceRole.entities.AlertaSistema.update(alert.id, {
        escalada: true,
        destinatario_rol: newRol,
        horas_sin_respuesta: Math.round(hours),
      });

      // Create escalation trace alert
      const trace = await base44.asServiceRole.entities.AlertaSistema.create({
        proyecto_id: alert.proyecto_id,
        partida_id: alert.partida_id || '',
        tipo: 'escalamiento',
        nivel: 'critica',
        titulo: `ESCALAMIENTO · ${alert.titulo}`,
        mensaje: `Alerta crítica sin respuesta por ${Math.round(hours)}h. Escalada de ${alert.destinatario_rol} → ${newRol}.`,
        estado: 'activa',
        destinatario_rol: newRol,
        escalada: true,
        horas_sin_respuesta: Math.round(hours),
      });

      escalated.push({
        original_id: alert.id,
        trace_id: trace.id,
        from: alert.destinatario_rol,
        to: newRol,
        hours: Math.round(hours),
      });
    }

    return Response.json({
      status: 'success',
      evaluated: candidates.length,
      escalated: escalated.length,
      skipped_demo: omitidos,
      details: escalated,
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}