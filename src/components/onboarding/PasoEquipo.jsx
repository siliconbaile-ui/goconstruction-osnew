import { ArrowRight, Check } from 'lucide-react';
import { CARGOS } from '@/lib/cargos';

// Paso 2 · Tu cargo define cómo te habla GO. Las invitaciones al equipo
// se hacen después desde Configuración, para no frenar la entrada.
export default function PasoEquipo({ miCargo, setMiCargo, onNext, onBack, guardando, soloCargo }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CARGOS.map(c => {
          const activo = miCargo === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setMiCargo(c.value)}
              className={`relative text-left px-4 py-3.5 rounded-xl border transition-colors ${
                activo ? 'border-primary bg-primary/10' : 'border-hairline bg-surface-raised hover:border-primary/40'}`}
            >
              {activo && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-primary">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </span>
              )}
              <span className="block text-sm font-semibold text-foreground pr-6">{c.label}</span>
              <span className="block text-[11px] text-muted-foreground mt-0.5">{c.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2.5">
        {onBack && (
          <button onClick={onBack}
            className="px-5 py-3.5 rounded-xl text-sm text-muted-foreground bg-surface-raised border border-hairline">
            Atrás
          </button>
        )}
        <button onClick={onNext} disabled={!miCargo || guardando}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity">
          {guardando ? 'Guardando...' : soloCargo ? 'Entrar a operar' : <>Continuar <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>

      {!soloCargo && (
        <p className="text-[11px] text-center text-muted-foreground">
          Invita a tu equipo cuando quieras desde Configuración.
        </p>
      )}
    </div>
  );
}