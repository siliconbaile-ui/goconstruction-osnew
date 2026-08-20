import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const { inspeccion_id } = await req.json();
    if (!inspeccion_id) return Response.json({ error: 'inspeccion_id requerido' }, { status: 400 });

    const insp = await db.InspeccionCalidad.get(inspeccion_id);
    if (!insp) return Response.json({ error: 'Inspección no encontrada' }, { status: 404 });

    if (['cerrada', 'aprobada'].includes(insp.estado)) {
      return Response.json({ cerrada: true, escalada: false });
    }

    const critica = insp.gravedad === 'critica';
    await db.AlertaSistema.create({
      proyecto_id: insp.proyecto_id,
      partida_id: insp.partida_id || '',
      tipo: 'escalamiento',
      nivel: 'critica',
      titulo: `NC sin cerrar tras 24h — escalada`,
      mensaje: `La no conformidad ${insp.numero_correlativo || insp.id} (${insp.gravedad}) sigue en estado "${insp.estado}" 24h después de su registro. El pago de la partida continúa retenido.`,
      estado: 'activa',
      destinatario_rol: critica ? 'alta_direccion' : 'gerencia_media',
      escalada: true,
      horas_sin_respuesta: 24,
      accion_correctiva_id: insp.id,
    });

    return Response.json({ cerrada: false, escalada: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}