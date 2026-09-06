import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { automatizacionPermitida } from '../../shared/gobernanza.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { partida_id } = await req.json();
    if (!partida_id) return Response.json({ error: 'partida_id requerido' }, { status: 400 });

    const partida = await base44.asServiceRole.entities.PartidaControl.get(partida_id);
    if (!partida) return Response.json({ error: 'Partida no encontrada' }, { status: 404 });

    // G1 · el demo no contamina las alertas reales
    const permiso = await automatizacionPermitida(base44, partida.proyecto_id);
    if (!permiso.permitida) return Response.json({ status: 'skip', motivo: permiso.motivo, alerta_creada: false });

    const prog = partida.avance_programado || 0;
    const real = partida.avance_real || 0;
    const desviacion = prog > 0 ? ((prog - real) / prog) * 100 : 0;

    // Umbral del proyecto (default 5%)
    let umbral = 5;
    if (partida.proyecto_id) {
      const proyecto = await base44.asServiceRole.entities.ProyectoObra.get(partida.proyecto_id).catch(() => null);
      if (proyecto?.umbral_desviacion) umbral = proyecto.umbral_desviacion;
    }

    if (desviacion <= umbral) {
      // Resolver alertas de desviación previas de esta partida si volvió a programa
      const previas = await base44.asServiceRole.entities.AlertaSistema.filter({
        partida_id: partida.id,
        tipo: 'desviacion_avance',
        estado: 'activa',
      });
      for (const a of previas) {
        await base44.asServiceRole.entities.AlertaSistema.update(a.id, { estado: 'resuelta' });
      }
      return Response.json({ status: 'ok', desviacion: +desviacion.toFixed(1), umbral, alerta_creada: false, resueltas: previas.length });
    }

    // Evitar duplicados: ya existe alerta activa de desviación para esta partida
    const existentes = await base44.asServiceRole.entities.AlertaSistema.filter({
      partida_id: partida.id,
      tipo: 'desviacion_avance',
      estado: 'activa',
    });
    if (existentes.length > 0) {
      return Response.json({ status: 'ok', desviacion: +desviacion.toFixed(1), umbral, alerta_creada: false, motivo: 'alerta activa existente' });
    }

    const critica = desviacion > umbral * 2;
    const alerta = await base44.asServiceRole.entities.AlertaSistema.create({
      proyecto_id: partida.proyecto_id,
      partida_id: partida.id,
      tipo: 'desviacion_avance',
      nivel: critica ? 'critica' : 'advertencia',
      titulo: `Desviación ${desviacion.toFixed(1)}% en "${partida.nombre}"`,
      mensaje: `Avance real ${real}% vs programado ${prog}% (umbral ${umbral}%). ${critica ? 'Desviación crítica — escalada a gerencia media.' : 'Requiere plan de acción del jefe de terreno.'}`,
      estado: 'activa',
      destinatario_rol: critica ? 'gerencia_media' : 'jefe_terreno',
      escalada: false,
      horas_sin_respuesta: 0,
    });

    return Response.json({
      status: 'ok',
      desviacion: +desviacion.toFixed(1),
      umbral,
      alerta_creada: true,
      alerta_id: alerta.id,
      nivel: critica ? 'critica' : 'advertencia',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}