import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { automatizacionPermitida } from '../../shared/gobernanza.ts';

// Consolida la semana de cada obra activa en un InformeEjecutivo:
// desviación de avance, NC abiertas, RDIs abiertos/vencidos, EDPs bloqueados
// y monto detenido. Diseñado para correr por scheduler los viernes.
function periodoSemana(hoy) {
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - 6);
  const f = (d) => d.toISOString().slice(0, 10);
  return `${f(inicio)} a ${f(hoy)}`;
}

async function informeDeProyecto(base44, proyecto) {
  const svc = base44.asServiceRole.entities;
  const [partidas, inspecciones, rdis, edps, alertas] = await Promise.all([
    svc.PartidaControl.filter({ proyecto_id: proyecto.id }),
    svc.InspeccionCalidad.filter({ proyecto_id: proyecto.id }),
    svc.RequerimientoInformacion.filter({ proyecto_id: proyecto.id }),
    svc.EstadoPago.filter({ proyecto_id: proyecto.id }),
    svc.AlertaSistema.filter({ proyecto_id: proyecto.id, estado: 'activa' }),
  ]);

  const conMonto = partidas.filter((p) => (p.monto_contrato_usd || 0) > 0);
  const base = conMonto.length ? conMonto : partidas;
  const total = base.reduce((s, p) => s + (p.monto_contrato_usd || 1), 0) || 1;
  const ponderado = (campo) =>
    base.reduce((s, p) => s + (p[campo] || 0) * (p.monto_contrato_usd || 1), 0) / total;

  const avanceProgramado = +ponderado('avance_programado').toFixed(1);
  const avanceReal = +ponderado('avance_real').toFixed(1);
  const desviacion = +(avanceProgramado - avanceReal).toFixed(1);

  const ncAbiertas = inspecciones.filter(
    (i) => i.es_no_conformidad && ['abierta', 'en_revision', 'rechazada'].includes(i.estado)
  );
  const ncCriticas = ncAbiertas.filter((i) => i.gravedad === 'critica');
  const rdisAbiertos = rdis.filter((r) => ['abierto', 'en_revision'].includes(r.estado));
  const rdisVencidos = rdis.filter((r) => r.estado === 'vencido');
  const edpsBloqueados = edps.filter((e) => e.estado === 'bloqueado_calidad');
  const montoBloqueado = edpsBloqueados.reduce((s, e) => s + (e.monto_usd || 0), 0);
  const alertasCriticas = alertas.filter((a) => a.nivel === 'critica');

  const umbral = proyecto.umbral_desviacion || 5;
  let estado = 'verde';
  if (desviacion > umbral || ncCriticas.length > 0 || rdisVencidos.length > 0) estado = 'amarillo';
  if (desviacion > umbral * 2 || alertasCriticas.length > 0 || edpsBloqueados.length > 2) estado = 'rojo';

  const riesgos = [];
  if (desviacion > umbral) riesgos.push(`Desviación de avance de ${desviacion} puntos sobre un umbral de ${umbral}%.`);
  if (ncCriticas.length) riesgos.push(`${ncCriticas.length} no conformidad(es) crítica(s) abiertas.`);
  if (rdisVencidos.length) riesgos.push(`${rdisVencidos.length} RDI vencido(s) sin respuesta del proyectista.`);
  if (edpsBloqueados.length) riesgos.push(`${edpsBloqueados.length} EDP bloqueado(s) por calidad, con USD ${montoBloqueado.toLocaleString('es-CL')} detenidos.`);
  if (alertasCriticas.length) riesgos.push(`${alertasCriticas.length} alerta(s) crítica(s) activas sin resolver.`);
  if (!riesgos.length) riesgos.push('Sin riesgos relevantes en la semana: avance dentro de umbral y sin NC críticas abiertas.');

  const acciones = [];
  if (ncCriticas.length) acciones.push('Cerrar con evidencia las NC críticas para liberar los pagos retenidos.');
  if (rdisVencidos.length) acciones.push('Escalar los RDI vencidos al mandante indicando la partida detenida.');
  if (desviacion > umbral) acciones.push('Definir plan de recuperación por partida desviada, con responsable y fecha.');
  if (!acciones.length) acciones.push('Mantener el ritmo y adelantar liberaciones de las partidas que arrancan la próxima semana.');

  const resumen =
    `Semana cerrada con avance real ${avanceReal}% frente a ${avanceProgramado}% programado ` +
    `(desviación ${desviacion} puntos). ${ncAbiertas.length} NC abiertas (${ncCriticas.length} críticas), ` +
    `${rdisAbiertos.length} RDI abiertos y ${rdisVencidos.length} vencidos. ` +
    `${edpsBloqueados.length} EDP bloqueados por calidad con USD ${montoBloqueado.toLocaleString('es-CL')} detenidos. ` +
    `Estado general: ${estado}.`;

  const informe = await base44.asServiceRole.entities.InformeEjecutivo.create({
    proyecto_id: proyecto.id,
    periodo: periodoSemana(new Date()),
    fecha_generacion: new Date().toISOString(),
    resumen_ejecutivo: resumen,
    riesgos_principales: riesgos.join('\n'),
    acciones_recomendadas: acciones.join('\n'),
    estado_general: estado,
    avance_real: avanceReal,
    avance_programado: avanceProgramado,
    desviacion,
    nc_abiertas: ncAbiertas.length,
    rdis_abiertos: rdisAbiertos.length,
    edps_bloqueados: edpsBloqueados.length,
    monto_bloqueado_usd: montoBloqueado,
    alertas_criticas: alertasCriticas.length,
    generado_por: 'GO · reporte semanal automático',
  });

  return { proyecto_id: proyecto.id, proyecto: proyecto.nombre, informe_id: informe.id, estado_general: estado, desviacion };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'user') return Response.json({ error: 'Forbidden' }, { status: 403 });
    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }

    const proyectos = body.proyecto_id
      ? [await base44.asServiceRole.entities.ProyectoObra.get(body.proyecto_id)].filter(Boolean)
      : await base44.asServiceRole.entities.ProyectoObra.filter({ estado: 'activo' });

    // A pedido explícito de un proyecto se genera igual (incluye el piloto/demo);
    // el scheduler, en cambio, solo consolida obras reales.
    const forzado = Boolean(body.proyecto_id);

    const generados = [];
    const omitidos = [];
    for (const proyecto of proyectos) {
      const permiso = forzado ? { permitida: true } : await automatizacionPermitida(base44, proyecto.id);
      if (!permiso.permitida) {
        omitidos.push({ proyecto_id: proyecto.id, motivo: permiso.motivo });
        continue;
      }
      generados.push(await informeDeProyecto(base44, proyecto));
    }

    return Response.json({ status: 'ok', informes: generados.length, generados, omitidos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}