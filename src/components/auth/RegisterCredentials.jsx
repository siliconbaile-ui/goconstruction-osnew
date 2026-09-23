import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterCredentials({ email, setEmail, password, setPassword, confirmPassword, setConfirmPassword }) {
  return <div className="grid grid-cols-2 gap-3">
    <div className="col-span-2 space-y-1.5"><Label htmlFor="email">Correo electrónico</Label><Input id="email" type="email" autoComplete="email" placeholder="nombre@empresa.cl" value={email} onChange={e => setEmail(e.target.value)} className="h-11 bg-background" required /></div>
    <div className="min-w-0 space-y-1.5"><Label htmlFor="password">Contraseña</Label><Input id="password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="h-11 bg-background" required /></div>
    <div className="min-w-0 space-y-1.5"><Label htmlFor="confirm">Confirmar</Label><Input id="confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-11 bg-background" required /></div>
  </div>;
}