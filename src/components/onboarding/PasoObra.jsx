import { useState } from 'react';
import { HardHat, Sparkles } from 'lucide-react';

const CAMPOS = [
  { key: 'nombre', label: 'Nombre de la obra *', type: 'text' },
  { key: 'codigo', label: 'Código interno', type: 'text' },
  { key: 'mandante', label: 'Mandante', type: 'text' },
  { key: 'presupuesto_total_usd', label: 'Presupuesto (USD)', type: 'number' },
  { key: 'fecha_inicio', label: 'Fecha inicio', type: 'date' },
  { key: 'fecha_fin_programada', label: 'Fecha fin programada', type: 'date' },
];

export default function PasoObra({ onFinish, onBack, guardando }) {
  const [modo, setModo] = useState(null); // 'nueva' | 'demo'
  const [obra, setObra] = useState({ nombre: '', codigo: '', mandante: '', presupuesto_total_usd: '', fecha_inicio: '', fecha_fin_programada: '' });

  return (
    <div className="orion-panel orion-elevated p-5 sm:p-7">
      <div className="flex items-center gap-2 mb-5">
        <HardHat className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-mono tracking-widest text-muted-foreground">PASO 3 · PRIMERA OBRA</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <button onClick={() => setModo('nueva')}
          className={`text-left p-4 rounded-xl border transition-colors ${modo === 'nueva' ? 'border-primary bg-primary/10' : 'border-hairline bg-surface-raised'}`}>
          <span className="block text-sm font-semibold text-foreground mb-1">Crear mi obra</span>
          <span className="block text-xs text-muted-foreground">Parte con los datos reales de tu proyecto.</span>
        </button>
        <button onClick={() => setModo('demo')}
          className={`text-left p-4 rounded-xl border transition-colors ${modo === 'demo' ? 'border-primary bg-primary/10' : 'border-hairline bg-surface-raised'}`}>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Explorar con obra demo
          </span>
          <span className="block text-xs text-muted-foreground">Edificio Corporativo Las Condes: partidas, NCs y EDPs cargados para probar GO.</span>
        </button>
      </div>

      {modo === 'nueva' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {CAMPOS.map(c => (
            <div key={c.key}>
              <label className="text-xs font-mono mb-1 block text-muted-foreground">{c.label}</label>
              <input type={c.type} value={obra[c.key]}
                onChange={e => setObra(p => ({ ...p, [c.key]: c.type === 'number' ? +e.target.value : e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-surface-raised border border-hairline text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className="px-5 py-3 rounded-xl text-sm text-muted-foreground bg-surface-raised border border-hairline">← Atrás</button>
        <button
          onClick={() => onFinish(modo, modo === 'nueva' ? obra : null)}
          disabled={!modo || (modo === 'nueva' && !obra.nombre.trim()) || guardando}
          className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity">
          {guardando ? 'Activando...' : 'Activar empresa'}
        </button>
      </div>
    </div>
  );
}