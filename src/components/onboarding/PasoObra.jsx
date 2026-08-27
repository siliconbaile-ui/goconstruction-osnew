import { useState } from 'react';
import { HardHat, Sparkles, Check } from 'lucide-react';

// Paso 3 · Última decisión: obra propia con lo mínimo, o demo cargada.
// Presupuesto y fechas se afinan después en Configuración.
const CAMPOS = [
  { key: 'nombre', label: 'Nombre de la obra', placeholder: 'Edificio Los Álamos' },
  { key: 'codigo', label: 'Código interno (opcional)', placeholder: 'OB-2026-01' },
  { key: 'mandante', label: 'Mandante (opcional)', placeholder: 'Inmobiliaria...' },
];

export default function PasoObra({ onFinish, onBack, guardando }) {
  const [modo, setModo] = useState(null); // 'nueva' | 'demo'
  const [obra, setObra] = useState({ nombre: '', codigo: '', mandante: '' });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          { key: 'nueva', icon: HardHat, titulo: 'Crear mi obra', texto: 'Parte con los datos reales de tu proyecto.' },
          { key: 'demo', icon: Sparkles, titulo: 'Explorar con obra demo', texto: 'Edificio Las Condes: partidas, NCs y EDPs cargados para probar GO.' },
        ].map(op => {
          const Icon = op.icon;
          const activo = modo === op.key;
          return (
            <button key={op.key} onClick={() => setModo(op.key)}
              className={`relative text-left p-4 rounded-xl border transition-colors ${
                activo ? 'border-primary bg-primary/10' : 'border-hairline bg-surface-raised hover:border-primary/40'}`}>
              {activo && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-primary">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </span>
              )}
              <Icon className="w-4 h-4 text-primary mb-2" />
              <span className="block text-sm font-semibold text-foreground pr-6">{op.titulo}</span>
              <span className="block text-[11px] text-muted-foreground mt-0.5 leading-snug">{op.texto}</span>
            </button>
          );
        })}
      </div>

      {modo === 'nueva' && (
        <div className="space-y-3">
          {CAMPOS.map((c, i) => (
            <div key={c.key}>
              <label className="text-sm font-medium mb-1.5 block text-foreground">{c.label}</label>
              <input
                value={obra[c.key]}
                placeholder={c.placeholder}
                autoFocus={i === 0}
                onChange={e => setObra(p => ({ ...p, [c.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm bg-surface-raised border border-hairline text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">Presupuesto y fechas se configuran después, con calma.</p>
        </div>
      )}

      <div className="flex gap-2.5">
        <button onClick={onBack}
          className="px-5 py-3.5 rounded-xl text-sm text-muted-foreground bg-surface-raised border border-hairline">
          Atrás
        </button>
        <button
          onClick={() => onFinish(modo, modo === 'nueva' ? obra : null)}
          disabled={!modo || (modo === 'nueva' && !obra.nombre.trim()) || guardando}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity">
          {guardando ? 'Activando...' : 'Entrar a operar'}
        </button>
      </div>
    </div>
  );
}