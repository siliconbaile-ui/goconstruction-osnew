import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CARGOS } from '@/lib/cargos';

export default function RegisterProfile({ nombre, setNombre, telefono, setTelefono, empresa, setEmpresa, cargo, setCargo }) {
  return <div className="grid grid-cols-2 gap-3">
    <div className="col-span-2 space-y-1.5"><Label htmlFor="nombre">Nombre y apellido</Label><Input id="nombre" autoComplete="name" autoFocus value={nombre} onChange={e => setNombre(e.target.value)} className="h-11 bg-background" required /></div>
    <div className="col-span-2 space-y-1.5"><Label htmlFor="telefono">Teléfono</Label><Input id="telefono" type="tel" autoComplete="tel" placeholder="+56 9 1234 5678" value={telefono} onChange={e => setTelefono(e.target.value)} className="h-11 bg-background" required /></div>
    <div className="min-w-0 space-y-1.5"><Label htmlFor="cargo">Cargo</Label><select id="cargo" value={cargo} onChange={e => setCargo(e.target.value)} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required><option value="">Selecciona</option>{CARGOS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
    <div className="min-w-0 space-y-1.5"><Label htmlFor="empresa">Empresa</Label><Input id="empresa" autoComplete="organization" value={empresa} onChange={e => setEmpresa(e.target.value)} className="h-11 bg-background" required /></div>
  </div>;
}