import { Leaf, ShieldCheck } from 'lucide-react';
const n = value => Number(value || 0).toLocaleString('es-CL');
export default function CertificadoPolpaico({ certificado: c }) {
  if (!c) return <div className="bg-card rounded-lg border border-border p-8 text-muted-foreground">Aún no hay certificados en este piloto.</div>;
  return <article className="polpaico-diploma bg-card text-card-foreground rounded-lg border-2 border-primary p-6 sm:p-8 relative overflow-hidden">
    <header className="flex justify-between items-start gap-4 border-b border-primary/20 pb-5"><div><p className="font-heading font-bold text-xl">polpaico soluciones</p><p className="text-[10px] tracking-[0.16em] mt-1">HORMIPURIFICA · PHOTIO</p></div><Leaf className="w-8 h-8" /></header>
    <p className="uppercase text-[10px] tracking-widest mt-6 mb-3 font-semibold">Demostración · {c.estado} · sin firma criptográfica</p>
    <h3 className="text-lg font-semibold tracking-wide leading-relaxed">CERTIFICADO DE MITIGACIÓN DE GASES DE EFECTO INVERNADERO</h3>
    <p className="text-sm mt-5 leading-relaxed">Polpaico Soluciones S.A. certifica que:<br /><strong>{n(c.volumen_m3)} m³ de {c.tipo_hormigon === 'hormieco' ? 'HormiEco' : 'HormiPurifica'}</strong> fueron suministrados a:</p>
    <dl className="text-sm space-y-2 mt-4"><div><dt className="inline font-semibold">Obra: </dt><dd className="inline">{c.obra_destinataria}</dd></div><div><dt className="inline font-semibold">Constructora: </dt><dd className="inline">{c.constructora}</dd></div></dl>
    <div className="grid grid-cols-3 gap-3 py-6 my-5 border-y border-primary/20">{[['Superficie', `${n(c.superficie_m2)} m²`], ['Árboles equivalentes', n(c.arboles_equivalentes)], ['CO₂ estimado', `${n(c.kg_co2_mitigado)} kg`]].map(([label, value]) => <div key={label}><p className="font-bold text-lg sm:text-xl">{value}</p><p className="text-[10px] mt-1">{label}</p></div>)}</div>
    <div className="text-xs space-y-1"><p>Código: <strong>{c.codigo_certificado}</strong></p><p>Fecha: {new Date(`${c.fecha_emision}T12:00:00Z`).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Santiago' })}</p></div>
    <footer className="mt-5 flex items-center gap-2 text-xs"><ShieldCheck className="w-5 h-5 shrink-0" /><span>Polpaico Soluciones · powered by b2bytes Agent OS</span></footer>
    <p className="text-[10px] mt-4 text-muted-foreground leading-relaxed">Documento de muestra; no acredita mitigación real. Factores preliminares: 2 árboles/m² y 0,85 kg CO₂/m², sin validación ambiental ni firma digital.</p>
  </article>;
}