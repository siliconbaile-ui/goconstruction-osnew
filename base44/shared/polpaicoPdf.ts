import { jsPDF } from 'npm:jspdf@4.0.0';
export async function crearPdfPolpaico(base44, c) {
  const doc = new jsPDF();
  doc.setFillColor(27,94,32); doc.rect(0,0,210,38,'F');
  doc.setTextColor(255); doc.setFontSize(24); doc.text('POLPAICO OS',20,24);
  doc.setTextColor(25); doc.setFontSize(16); doc.text('BORRADOR ESG · DEMOSTRACION',20,54);
  doc.setFontSize(11);
  const lineas=[`Codigo: ${c.codigo_certificado}`, `Obra: ${c.obra_destinataria}`, `Constructora: ${c.constructora}`, `Hormigon: ${c.tipo_hormigon}`, `Volumen: ${c.volumen_m3} m3`, `Espesor: ${c.espesor_m} m`, `Superficie estimada: ${c.superficie_m2} m2`, `Arboles equivalentes estimados: ${c.arboles_equivalentes}`, `CO2 estimado: ${c.kg_co2_mitigado} kg`, `Fecha: ${c.fecha_emision}`];
  lineas.forEach((t,i)=>doc.text(doc.splitTextToSize(t,170),20,72+i*13));
  doc.setFontSize(10); doc.text(doc.splitTextToSize('Datos del piloto, sin validez de certificacion ambiental ni firma digital. Factores preliminares: 2 arboles/m2 y 0.85 kg CO2/m2. La metodologia requiere validacion independiente. No acredita mitigacion real.',170),20,218);
  doc.text('Powered by b2bytes Agent OS',20,274);
  const file=new File([doc.output('arraybuffer')],`${c.codigo_certificado}.pdf`,{type:'application/pdf'});
  const uploaded=await base44.integrations.Core.UploadPrivateFile({file});
  return uploaded.file_uri;
}