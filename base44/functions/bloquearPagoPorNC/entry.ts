import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const { inspeccion_id } = await req.json();
    if (!inspeccion_id) return Response.json({ error: 'inspeccion_id requerido' }, { status: 400 });

    const insp = await db.InspeccionCalidad.get(inspeccion_id);
    if (!insp) return Response.json({ error: 'Inspección no encontrada' }, { status: 404 });

    const acciones = [];

    // 1. Bloquear la partida asociada (No Quality, No Pay)
    let partida = null;
    if (insp.partida_id) {
      partida = await db.PartidaControl.get(insp.partida_id);
      if (partida) {
        await db.PartidaControl.update(partida.id, {
          estado_calidad: 'rechazado',
          estado_pago: 'bloqueado',
        });
        acciones.push(`Partida ${partida.nombre} bloqueada para pago`);
      }
    }

    // 2. Bloquear los EDPs no pagados de esa partida
    let montoBloqueado = 0;
    if (insp.partida_id) {
      const edps = await db.EstadoPago.filter({ partida_id: insp.partida_id }, '-created_date', 50);
      for (const edp of edps) {
        if (['borrador', 'pendiente_firma'].includes(edp.estado)) {
          await db.EstadoPago.update(edp.id, {
            estado: 'bloqueado_calidad',
            motivo_bloqueo: `No conformidad ${insp.numero_correlativo || insp.id} (${insp.gravedad}) abierta en la partida`,
            nc_ids: insp.id,
            calidad_verificada: false,
          });
          montoBloqueado += edp.monto_usd || 0;
          acciones.push(`EDP ${edp.numero_edp || edp.id} bloqueado`);
        }
      }
    }

    // 3. Alerta al nivel que corresponde
    const critica = insp.gravedad === 'critica';
    await db.AlertaSistema.create({
      proyecto_id: insp.proyecto_id,
      partida_id: insp.partida_id || '',
      tipo: 'no_conformidad',
      nivel: critica ? 'critica' : 'advertencia',
      titulo: `No conformidad ${insp.gravedad} — pago retenido`,
      mensaje: `${insp.descripcion || 'NC registrada en terreno'}${partida ? ` · Partida: ${partida.nombre}` : ''}${montoBloqueado > 0 ? ` · USD ${montoBloqueado.toLocaleString('en-US')} retenidos` : ''}. Regla No Quality No Pay aplicada automáticamente.`,
      estado: 'activa',
      destinatario_rol: critica ? 'gerencia_media' : 'jefe_terreno',
      accion_correctiva_id: insp.id,
    });

    return Response.json({ ok: true, monto_bloqueado_usd: montoBloqueado, acciones });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}