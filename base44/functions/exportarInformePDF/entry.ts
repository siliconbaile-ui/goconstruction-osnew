import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { jsPDF } from 'npm:jspdf@4.0.0';

// Exporta un InformeEjecutivo a PDF y devuelve un link de descarga válido 24 h.
// Uso: { informe_id } o { proyecto_id } (toma el informe más reciente de la obra).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    let informe = null;

    if (body.informe_id) {
      informe = await base44.entities.InformeEjecutivo.get(body.informe_id);
    } else if (body.proyecto_id) {
      const lista = await base44.entities.InformeEjecutivo.filter(
        { proyecto_id: body.proyecto_id }, '-created_date', 1
      );
      informe = lista[0] || null;
    }
    if (!informe) {
      return Response.json({ error: 'No se encontró el informe. Entrega informe_id o proyecto_id con un informe generado.' }, { status: 404 });
    }

    let proyecto = null;
    if (informe.proyecto_id) {
      proyecto = await base44.entities.ProyectoObra.get(informe.proyecto_id).catch(() => null);
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const M = 48;
    const ANCHO = 595 - M * 2;
    let y = M;

    const semaforo = { verde: [39, 174, 96], amarillo: [211, 132, 0], rojo: [211, 84, 0] };
    const color = semaforo[informe.estado_general] || semaforo.verde;

    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(M, y, ANCHO, 6, 'F');
    y += 30;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Informe Ejecutivo de Obra', M, y);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90);
    const cabecera = [
      `Obra: ${proyecto?.nombre || informe.proyecto_id || '—'}${proyecto?.codigo ? ' · ' + proyecto.codigo : ''}`,
      `Mandante: ${proyecto?.mandante || '—'}`,
      `Período: ${informe.periodo || '—'}`,
      `Estado general: ${(informe.estado_general || '—').toUpperCase()}`,
      `Generado: ${(informe.fecha_generacion || informe.created_date || '').toString().slice(0, 16).replace('T', ' ')}`,
    ];
    for (const linea of cabecera) { doc.text(linea, M, y); y += 15; }
    y += 10;

    const bloqueTitulo = (t) => {
      if (y > 740) { doc.addPage(); y = M; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text(t, M, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(70);
    };

    const parrafo = (texto) => {
      const lineas = doc.splitTextToSize(texto || '—', ANCHO);
      for (const l of lineas) {
        if (y > 780) { doc.addPage(); y = M; }
        doc.text(l, M, y);
        y += 14;
      }
      y += 8;
    };

    bloqueTitulo('Indicadores');
    const kpis = [
      ['Avance real', `${informe.avance_real ?? 0}%`],
      ['Avance programado', `${informe.avance_programado ?? 0}%`],
      ['Desviación', `${informe.desviacion ?? 0} pts`],
      ['NC abiertas', `${informe.nc_abiertas ?? 0}`],
      ['RDIs abiertos', `${informe.rdis_abiertos ?? 0}`],
      ['EDPs bloqueados', `${informe.edps_bloqueados ?? 0}`],
      ['Monto retenido', `USD ${(informe.monto_bloqueado_usd ?? 0).toLocaleString('es-CL')}`],
      ['Alertas críticas', `${informe.alertas_criticas ?? 0}`],
    ];
    for (const [k, v] of kpis) {
      if (y > 780) { doc.addPage(); y = M; }
      doc.text(k, M, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(v), M + 300, y);
      doc.setFont('helvetica', 'normal');
      y += 15;
    }
    y += 10;

    bloqueTitulo('Resumen ejecutivo');
    parrafo(informe.resumen_ejecutivo);

    bloqueTitulo('Riesgos principales');
    parrafo(informe.riesgos_principales);

    bloqueTitulo('Acciones recomendadas');
    parrafo(informe.acciones_recomendadas);

    doc.setFontSize(8.5);
    doc.setTextColor(140);
    doc.text('GoConstruction OS · gobim.lat · documento generado automáticamente', M, 812);

    const bytes = doc.output('arraybuffer');
    const nombre = `informe-${(proyecto?.codigo || 'obra')}-${(informe.periodo || 'periodo')}.pdf`.replace(/\s+/g, '-');
    const archivo = new File([bytes], nombre, { type: 'application/pdf' });

    const subida = await base44.integrations.Core.UploadPrivateFile({ file: archivo });
    const firmado = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: subida.file_uri,
      expires_in: 86400,
    });

    return Response.json({
      status: 'ok',
      informe_id: informe.id,
      obra: proyecto?.nombre || null,
      periodo: informe.periodo || null,
      estado_general: informe.estado_general || null,
      nombre_archivo: nombre,
      url: firmado.signed_url,
      expira_en_horas: 24,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}