import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const { edp_id } = await req.json();
    if (!edp_id) return Response.json({ error: 'edp_id requerido' }, { status: 400 });

    const edp = await db.EstadoPago.get(edp_id);
    if (!edp) return Response.json({ error: 'EDP no encontrado' }, { status: 404 });

    const inspecciones = edp.partida_id
      ? await db.InspeccionCalidad.filter({ partida_id: edp.partida_id }, '-created_date', 100)
      : [];
    const ncAbiertas = inspecciones.filter(i =>
      i.es_no_conformidad && !['cerrada', 'aprobada'].includes(i.estado)
    );
    const ncCriticas = ncAbiertas.filter(i => i.gravedad === 'critica');

    const partida = edp.partida_id ? await db.PartidaControl.get(edp.partida_id) : null;
    const avanceOk = partida ? (edp.porcentaje_avance || 0) <= (partida.avance_real || 0) + 1 : true;

    if (ncCriticas.length > 0 || !avanceOk) {
      const motivo = ncCriticas.length > 0
        ? `${ncCriticas.length} NC crítica(s) abierta(s) en la partida: ${ncCriticas.map(i => i.numero_correlativo || i.id).join(', ')}`
        : `El % cobrado (${edp.porcentaje_avance || 0}%) supera el avance real verificado (${partida?.avance_real || 0}%)`;

      await db.EstadoPago.update(edp.id, {
        estado: 'bloqueado_calidad',
        motivo_bloqueo: motivo,
        nc_ids: ncCriticas.map(i => i.id).join(','),
        calidad_verificada: false,
        avance_verificado: avanceOk,
      });

      await db.AlertaSistema.create({
        proyecto_id: edp.proyecto_id,
        partida_id: edp.partida_id || '',
        tipo: 'pago_bloqueado',
        nivel: 'critica',
        titulo: `EDP ${edp.numero_edp || ''} bloqueado antes de firma`,
        mensaje: `${motivo}. Monto retenido: USD ${(edp.monto_usd || 0).toLocaleString('en-US')} · Subcontratista: ${edp.subcontratista || 'sin registrar'}.`,
        estado: 'activa',
        destinatario_rol: 'administrador',
      });

      return Response.json({ aprobable: false, motivo, monto_retenido_usd: edp.monto_usd || 0 });
    }

    await db.EstadoPago.update(edp.id, {
      calidad_verificada: true,
      avance_verificado: true,
      motivo_bloqueo: '',
      observaciones: `Validación automática Orion: sin NC críticas abiertas${ncAbiertas.length > 0 ? ` (${ncAbiertas.length} NC leve/moderada abiertas)` : ''}. Avance cobrado consistente con avance real.`,
    });

    return Response.json({ aprobable: true, nc_abiertas: ncAbiertas.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}