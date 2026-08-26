import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { automatizacionPermitida } from '../../shared/gobernanza.ts';

const DIA_MS = 24 * 60 * 60 * 1000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];

    const abiertos = await base44.asServiceRole.entities.RequerimientoInformacion.filter({
      estado: { $in: ['abierto', 'en_revision'] },
    });

    let vencidos = 0;
    let alertas = 0;
    let omitidos = 0;

    for (const rdi of abiertos) {
      // G1 · proyectos demo, pausados o en configuración quedan fuera
      const permiso = await automatizacionPermitida(base44, rdi.proyecto_id);
      if (!permiso.permitida) { omitidos++; continue; }

      const estaVencido = rdi.fecha_vencimiento && rdi.fecha_vencimiento < hoyStr;
      // Regla: RDI sin especialista asignado no puede superar 2h desde su creación
      const horasSinAsignar = rdi.created_date
        ? (hoy.getTime() - new Date(rdi.created_date).getTime()) / (60 * 60 * 1000)
        : 0;
      const sinAsignarCritico = !rdi.especialista_asignado && horasSinAsignar > 2;

      if (!estaVencido && !sinAsignarCritico) continue;

      if (estaVencido) {
        await base44.asServiceRole.entities.RequerimientoInformacion.update(rdi.id, { estado: 'vencido' });
        vencidos++;
      }

      const existentes = await base44.asServiceRole.entities.AlertaSistema.filter({
        proyecto_id: rdi.proyecto_id,
        tipo: 'rdi_vencido',
        estado: 'activa',
      });
      const yaTiene = existentes.some(a => (a.mensaje || '').includes(rdi.numero_rdi || rdi.titulo));
      if (yaTiene) continue;

      const diasVencido = estaVencido
        ? Math.floor((hoy.getTime() - new Date(rdi.fecha_vencimiento).getTime()) / DIA_MS)
        : 0;
      const critico = estaVencido && (diasVencido >= 3 || ['alta', 'critica'].includes(rdi.prioridad));

      await base44.asServiceRole.entities.AlertaSistema.create({
        proyecto_id: rdi.proyecto_id,
        partida_id: rdi.partida_id,
        tipo: 'rdi_vencido',
        nivel: critico ? 'critica' : 'advertencia',
        titulo: estaVencido
          ? `RDI vencido: ${rdi.numero_rdi || rdi.titulo}`
          : `RDI sin especialista asignado: ${rdi.numero_rdi || rdi.titulo}`,
        mensaje: estaVencido
          ? `${rdi.numero_rdi || ''} "${rdi.titulo}" venció hace ${diasVencido} día(s). Prioridad ${rdi.prioridad || 'media'}. Responsable: ${rdi.especialista_asignado || 'SIN ASIGNAR'}.`
          : `${rdi.numero_rdi || ''} "${rdi.titulo}" lleva ${Math.floor(horasSinAsignar)}h sin especialista asignado (máximo 2h). Asignar de inmediato.`,
        estado: 'activa',
        destinatario_rol: critico ? 'gerencia_media' : 'jefe_terreno',
        escalada: false,
        horas_sin_respuesta: 0,
      });
      alertas++;
    }

    return Response.json({
      status: 'ok',
      rdis_evaluados: abiertos.length,
      omitidos_demo: omitidos,
      marcados_vencidos: vencidos,
      alertas_creadas: alertas,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}