import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Send, Shield } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import { CARGOS, labelCargo } from '@/lib/cargos';

// Panel de equipo: quién está en la plataforma, con qué rol y qué cargo de obra.
export default function GestionEquipo() {
  const [equipo, setEquipo] = useState([]);
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('user');
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [yo, setYo] = useState(null);

  useEffect(() => {
    (async () => {
      const [users, me] = await Promise.all([base44.entities.User.list(), base44.auth.me()]);
      setEquipo(users);
      setYo(me);
    })();
  }, []);

  const invitar = async () => {
    if (!email.trim()) return;
    setEnviando(true);
    setMsg('');
    try {
      await base44.users.inviteUser(email.trim(), rol);
      setMsg(`Invitación enviada a ${email.trim()}.`);
      setEmail('');
    } catch {
      setMsg('No se pudo enviar la invitación.');
    } finally {
      setEnviando(false);
    }
  };

  const cambiarMiCargo = async (cargo) => {
    await base44.auth.updateMe({ cargo });
    setYo(prev => ({ ...prev, cargo }));
    setEquipo(prev => prev.map(u => u.id === yo.id ? { ...u, cargo } : u));
  };

  return (
    <OrionCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <span className="font-mono text-xs uppercase text-muted-foreground">EQUIPO Y PERFILES</span>
      </div>

      {yo && (
        <div className="mb-4">
          <label className="text-xs font-mono mb-1 block text-muted-foreground">Mi cargo en obra</label>
          <select
            value={yo.cargo || ''}
            onChange={e => cambiarMiCargo(e.target.value)}
            className="w-full sm:w-72 px-3 py-2.5 rounded-lg text-sm bg-surface-raised border border-hairline text-foreground"
          >
            <option value="">Sin definir</option>
            {CARGOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-1.5 mb-4">
        {equipo.map(u => (
          <div key={u.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-raised min-w-0">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: u.role === 'admin' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-foreground truncate">{u.full_name || u.email}</span>
              <span className="block text-[10px] font-mono text-muted-foreground truncate">
                {u.role === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'} · {labelCargo(u.cargo).toUpperCase()}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="correo@empresa.cl"
          className="flex-1 px-3 py-2.5 rounded-lg text-sm bg-surface-raised border border-hairline text-foreground" />
        <select value={rol} onChange={e => setRol(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm bg-surface-raised border border-hairline text-foreground">
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
        <button onClick={invitar} disabled={enviando || !email.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground disabled:opacity-40">
          <Send className="w-3.5 h-3.5" /> Invitar
        </button>
      </div>
      {msg && <p className="text-xs mt-2 text-muted-foreground">{msg}</p>}
    </OrionCard>
  );
}