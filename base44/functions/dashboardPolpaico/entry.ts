import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Proyección pública, de solo lectura, exclusivamente del piloto autorizado.
const PILOTO_ID = '6a9f1261cdec16c7f4ff4774';
const pick = (row, fields) => Object.fromEntries(fields.split(' ').map(key => [key, row[key]]));
const sum = (rows, field) => rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
const diaChile = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    if (body.proyecto_id && body.proyecto_id !== PILOTO_ID) return Response.json({ error: 'Este portal solo expone el piloto Polpaico.' }, { status: 403 });
    const entities = base44.asServiceRole.entities;
    const [proyecto] = await entities.ProyectoObra.filter({ id: PILOTO_ID, codigo: 'POLPAICO-DEMO-01', es_demo: true }, undefined, 1);
    if (!proyecto) return Response.json({ error: 'Piloto no disponible.' }, { status: 404 });
    const all = async (name, order) => {
      const rows = [];
      for (let skip = 0; ; skip += 200) {
        const batch = await entities[name].filter({ proyecto_id: proyecto.id }, order, 200, skip);
        rows.push(...batch);
        if (batch.length < 200) return rows;
      }
    };
    const [partidas, despachos, telemetria, inspecciones, edps, certificados, alertas, informes] = await Promise.all([
      all('PartidaControl', 'codigo'), all('DespachoMixer', '-fecha_hora_carga'), all('TelemetriaLectura', 'timestamp_lectura'), all('InspeccionCalidad', '-created_date'), all('EstadoPago', 'numero_edp'), all('CertificadoESG', '-created_date'), all('AlertaSistema', '-created_date'), entities.InformeEjecutivo.filter({ proyecto_id: proyecto.id }, '-fecha_generacion', 1),
    ]);
    const ncs = inspecciones.filter(i => i.es_no_conformidad);
    const abiertas = ncs.filter(i => !['cerrada', 'aprobada'].includes(i.estado));
    const bloqueados = edps.filter(e => e.estado === 'bloqueado_calidad');
    const hoy = diaChile(Date.now());
    const despachosHoy = despachos.filter(d => d.fecha_hora_carga && diaChile(d.fecha_hora_carga) === hoy);
    const emitidos = certificados.filter(c => ['emitido', 'firmado'].includes(c.estado));
    const sensores = partidas.filter(p => p.sensor_id);
    return Response.json({
      proyecto: pick(proyecto, 'id nombre codigo mandante estado es_demo avance_real avance_programado umbral_desviacion'),
      partidas: partidas.map(p => pick(p, 'id codigo nombre estado estado_calidad estado_pago avance_real avance_programado mpa_lectura_actual mpa_especificado volumen_m3 tipo_hormigon sensor_id')),
      despachos: despachos.map(d => pick(d, 'id partida_id guia_despacho chofer_nombre patente_mixer origen_planta destino_obra volumen_m3 tipo_hormigon estado fecha_hora_carga fecha_hora_descarga audio_transcripcion coordenadas_gps observaciones')),
      telemetria: telemetria.map(t => pick(t, 'id partida_id sensor_id timestamp_lectura mpa_lectura temperatura_c fuente')),
      ncs: ncs.map(n => pick(n, 'id partida_id numero_correlativo descripcion gravedad estado evidencia_foto_url coordenadas_gps observacion')),
      edps: edps.map(e => pick(e, 'id partida_id numero_edp monto_usd estado motivo_bloqueo nc_ids')),
      certificados: certificados.map(c => pick(c, 'id partida_id tipo_hormigon volumen_m3 espesor_m superficie_m2 arboles_equivalentes kg_co2_mitigado obra_destinataria constructora codigo_certificado fecha_emision estado')),
      alertas: alertas.map(a => pick(a, 'id partida_id tipo nivel titulo mensaje estado')),
      informe: informes[0] ? pick(informes[0], 'id estado_general fecha_generacion periodo resumen_ejecutivo') : null,
      kpis: { despachos_hoy: despachosHoy.length, en_ruta: despachosHoy.filter(d => d.estado === 'en_ruta').length, descargados: despachosHoy.filter(d => d.estado === 'descargado').length, volumen_transportado: sum(despachosHoy.filter(d => d.estado !== 'cancelado'), 'volumen_m3'), nc_abiertas: abiertas.length, nc_criticas: abiertas.filter(n => n.gravedad === 'critica').length, edps_bloqueados: bloqueados.length, monto_retenido: sum(bloqueados, 'monto_usd'), desviacion: (proyecto.avance_programado || 0) - (proyecto.avance_real || 0), volumen_trazado: sum(partidas, 'volumen_m3'), volumen_hormipurifica: sum(partidas.filter(p => p.tipo_hormigon === 'hormipurifica'), 'volumen_m3'), superficie: sum(emitidos, 'superficie_m2'), arboles: sum(emitidos, 'arboles_equivalentes'), co2: sum(emitidos, 'kg_co2_mitigado'), sensores: sensores.length, sensores_optimos: sensores.filter(p => p.mpa_especificado > 0 && p.mpa_lectura_actual >= p.mpa_especificado).length },
      actualizado_en: new Date().toISOString(), fecha_hoy_chile: hoy, simulacion: true,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}