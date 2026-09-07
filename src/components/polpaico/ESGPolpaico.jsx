import PolpaicoSection from '@/components/polpaico/PolpaicoSection';
import PolpaicoMetrics from '@/components/polpaico/PolpaicoMetrics';
import CertificadoPolpaico from '@/components/polpaico/CertificadoPolpaico';
import CalculadoraESG from '@/components/polpaico/CalculadoraESG';
const n = value => Number(value || 0).toLocaleString('es-CL');
export default function ESGPolpaico({ data }) {
  const k = data.kpis;
  const emitidos = data.certificados;
  return <PolpaicoSection id="esg" number="04" eyebrow="Del m³ al impacto" title="Certificados ESG — HormiPurifica + Photio" subtitle="Trazabilidad del hormigón verde y equivalencias ambientales estimadas. Certificados de demostración, sin firma criptográfica.">
    <PolpaicoMetrics items={[{ label: 'm³ HormiPurifica trazados', value: n(k.volumen_hormipurifica) }, { label: 'm² superficie descontaminante', value: n(k.superficie), tone: 'text-ok' }, { label: 'Árboles equivalentes acumulados', value: n(k.arboles), tone: 'text-ok', detail: 'Estimación preliminar' }, { label: 'CO₂ mitigado total estimado', value: `${n(k.co2)} kg`, tone: 'text-ok' }]} />
    <div className="grid lg:grid-cols-2 gap-6"><div className="space-y-5">{emitidos.length ? emitidos.map(c => <CertificadoPolpaico key={c.id} certificado={c} />) : <CertificadoPolpaico />}</div><CalculadoraESG /></div>
  </PolpaicoSection>;
}