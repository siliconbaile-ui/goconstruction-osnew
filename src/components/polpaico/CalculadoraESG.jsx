import { useState } from 'react';
import { Calculator } from 'lucide-react';
const n = value => value.toLocaleString('es-CL', { maximumFractionDigits: 2 });
export default function CalculadoraESG() {
  const [volumen, setVolumen] = useState('480');
  const [espesor, setEspesor] = useState('0.15');
  const [tipo, setTipo] = useState('hormipurifica');
  const valido = Number.isFinite(Number(volumen)) && Number(volumen) > 0 && Number.isFinite(Number(espesor)) && Number(espesor) > 0;
  const superficie = valido ? Number(volumen) / Number(espesor) : 0;
  return <div className="bg-card rounded-lg border border-border p-6 h-fit">
    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Calculator className="w-5 h-5 text-ok" />Calculadora de impacto</h3><p className="text-sm text-muted-foreground mb-6">Explora la equivalencia estimada de tu próximo vaciado.</p>
    <div className="grid grid-cols-2 gap-4"><label className="text-sm" htmlFor="esg-volumen">Volumen (m³)<input id="esg-volumen" type="number" min="0.01" step="any" value={volumen} onChange={e => setVolumen(e.target.value)} className="mt-2 w-full bg-background border border-input p-3 rounded" /></label><label className="text-sm" htmlFor="esg-espesor">Espesor (m)<input id="esg-espesor" type="number" min="0.001" step="0.01" value={espesor} onChange={e => setEspesor(e.target.value)} className="mt-2 w-full bg-background border border-input p-3 rounded" /></label></div>
    <label className="block text-sm mt-5" htmlFor="esg-tipo">Tipo de hormigón<select id="esg-tipo" value={tipo} onChange={e => setTipo(e.target.value)} className="block w-full mt-2 bg-background border border-input p-3 rounded"><option value="hormipurifica">HormiPurifica</option><option value="hormieco">HormiEco</option></select></label>
    {!valido && <p role="alert" className="text-warn text-sm mt-3">Ingresa un volumen y un espesor mayores que cero.</p>}
    <dl aria-live="polite" className="mt-6 space-y-4">{[['Superficie tratada', `${n(superficie)} m²`], ['Equivalencia forestal', `${n(superficie * 2)} árboles`], ['CO₂ estimado', `${n(superficie * 0.85)} kg`]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-border pb-3"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-mono text-ok text-sm">{valido ? value : '—'}</dd></div>)}</dl>
    <p className="text-xs text-muted-foreground leading-relaxed mt-5">Cálculo exploratorio, no emite certificados. Se usan los mismos factores preliminares del piloto para ambos tipos; la metodología de HormiEco requiere validación específica.</p>
  </div>;
}