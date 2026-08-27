import { ArrowRight } from 'lucide-react';

// Paso 1 · Solo lo esencial para crear la cuenta de empresa.
// El resto del perfil (giro, dirección, teléfono) se completa en Configuración.
export default function PasoEmpresa({ form, setForm, onNext, guardando }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium mb-2 block text-foreground">Razón social</label>
        <input
          value={form.nombre || ''}
          placeholder="Constructora Ejemplo SpA"
          autoFocus
          onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter' && form.nombre?.trim() && !guardando) onNext(); }}
          className="w-full px-4 py-3.5 rounded-xl text-base bg-surface-raised border border-hairline text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block text-foreground">
          RUT <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <input
          value={form.rut || ''}
          placeholder="76.123.456-7"
          onChange={e => setForm(p => ({ ...p, rut: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter' && form.nombre?.trim() && !guardando) onNext(); }}
          className="w-full px-4 py-3.5 rounded-xl text-base bg-surface-raised border border-hairline text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>
      <button
        onClick={onNext}
        disabled={!form.nombre?.trim() || guardando}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
      >
        {guardando ? 'Guardando...' : <>Continuar <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="text-[11px] text-center text-muted-foreground">
        El resto del perfil de empresa se completa después, desde Configuración.
      </p>
    </div>
  );
}