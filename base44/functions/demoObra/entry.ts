import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// MODO 2 · DEMO read-only. Endpoint público que entrega SOLO el snapshot curado
// del proyecto demo BES-2026-01. No escribe nada y no expone otros proyectos.
const CODIGO_DEMO = 'BES-2026-01';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;

    const proyectos = await svc.ProyectoObra.filter({ codigo: CODIGO_DEMO, es_demo: true }, '-created_date', 1);
    const proyecto = proyectos[0];
    if (!proyecto) return Response.json({ error: 'Proyecto demo no disponible' }, { status: 404 });

    const q = { proyecto_id: proyecto.id };
    const [partidas, inspecciones, rdis, edps, alertas, documentos] = await Promise.all([
      svc.PartidaControl.filter(q, 'codigo', 50),
      svc.InspeccionCalidad.filter(q, '-created_date', 50),
      svc.RequerimientoInformacion.filter(q, '-created_date', 50),
      svc.EstadoPago.filter(q, '-created_date', 50),
      svc.AlertaSistema.filter({ ...q, estado: 'activa' }, '-created_date', 50),
      svc.DocumentoTecnico.filter(q, '-created_date', 20),
    ]);

    const ncAbiertas = inspecciones.filter(i => i.es_no_conformidad && ['abierta', 'en_revision'].includes(i.estado));
    const edpsBloqueados = edps.filter(e => e.estado === 'bloqueado_calidad');

    return Response.json({
      proyecto: {
        nombre: proyecto.nombre,
        codigo: proyecto.codigo,
        mandante: proyecto.mandante,
        administrador: proyecto.administrador,
        jefe_terreno: proyecto.jefe_terreno,
        avance_real: proyecto.avance_real,
        avance_programado: proyecto.avance_programado,
        presupuesto_total_usd: proyecto.presupuesto_total_usd,
        umbral_desviacion: proyecto.umbral_desviacion,
      },
      kpis: {
        nc_abiertas: ncAbiertas.length,
        rdis_pendientes: rdis.filter(r => ['abierto', 'en_revision', 'vencido'].includes(r.estado)).length,
        edps_bloqueados: edpsBloqueados.length,
        monto_bloqueado_usd: edpsBloqueados.reduce((s, e) => s + (e.monto_usd || 0), 0),
        alertas_activas: alertas.length,
        documentos_indexados: documentos.filter(d => d.estado_indexacion === 'indexado').length,
      },
      partidas: partidas.map(p => ({
        codigo: p.codigo, nombre: p.nombre, categoria: p.categoria,
        avance_real: p.avance_real, avance_programado: p.avance_programado,
        estado: p.estado, estado_calidad: p.estado_calidad, estado_pago: p.estado_pago,
        subcontratista: p.subcontratista, monto_contrato_usd: p.monto_contrato_usd,
      })),
      alertas: alertas.map(a => ({ nivel: a.nivel, titulo: a.titulo, mensaje: a.mensaje, tipo: a.tipo })),
      edps: edps.map(e => ({ numero_edp: e.numero_edp, subcontratista: e.subcontratista, monto_usd: e.monto_usd, estado: e.estado, motivo_bloqueo: e.motivo_bloqueo })),
      rdis: rdis.map(r => ({ numero_rdi: r.numero_rdi, titulo: r.titulo, estado: r.estado, prioridad: r.prioridad, fecha_vencimiento: r.fecha_vencimiento })),
      inspecciones: inspecciones.map(i => ({ numero_correlativo: i.numero_correlativo, descripcion: i.descripcion || i.observacion, gravedad: i.gravedad, estado: i.estado, es_no_conformidad: i.es_no_conformidad })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}