import { Building2 } from 'lucide-react';

const CAMPOS = [
  { key: 'nombre', label: 'Razón social *', placeholder: 'Constructora Ejemplo SpA' },
  { key: 'rut', label: 'RUT', placeholder: '76.123.456-7' },
  { key: 'giro', label: 'Giro', placeholder: 'Construcción de edificios' },
  { key: 'email_contacto', label: 'Email de contacto', placeholder: 'contacto@empresa.cl' },
  { key: 'telefono', label: 'Teléfono', placeholder: '+56 9 ...' },
  { key: 'direccion', label: 'Dirección', placeholder: 'Av. Apoquindo 1234, Las Condes' },
];

export default function PasoEmpresa({ form, setForm, onNext, guardando }) {
  return (
    <div className="orion-panel orion-elevated p-5 sm:p-7">
      <div className="flex items-center gap-2 mb-5">
        <Building2 className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-mono tracking-widest text-muted-foreground">PASO 1 · DATOS DE LA EMPRESA</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {CAMPOS.map(c => (
          <div key={c.key} className={c.key === 'direccion' ? 'sm:col-span-2' : ''}>
            <label className="text-xs font-mono mb-1 block text-muted-foreground">{c.label}</label>
            <input
              value={form[c.key] || ''}
              placeholder={c.placeholder}
              onChange={e => setForm(p => ({ ...p, [c.key]: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-surface-raised border border-hairline text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!form.nombre?.trim() || guardando}
        className="w-full px-6 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
      >
        {guardando ? 'Guardando...' : 'Continuar → Equipo'}
      </button>
    </div>
  );
}