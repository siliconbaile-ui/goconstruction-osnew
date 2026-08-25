import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Send, CheckCircle } from 'lucide-react';

export const CARGOS = [
  { value: 'gerencia', label: 'Gerencia' },
  { value: 'administrador_obra', label: 'Administrador de Obra' },
  { value: 'jefe_terreno', label: 'Jefe de Terreno' },
  { value: 'jefe_calidad', label: 'Jefe de Calidad' },
  { value: 'oficina_tecnica', label: 'Oficina Técnica' },
  { value: 'prevencionista', label: 'Prevencionista' },
  { value: 'capataz', label: 'Capataz' },
];

export default function PasoEquipo({ miCargo, setMiCargo, onNext, onBack }) {
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('user');
  const [invitados, setInvitados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const invitar = async () => {
    if (!email.trim()) return;
    setEnviando(true);
    setError('');
    try {
      await base44.users.inviteUser(email.trim(), rol);
      setInvitados(prev => [...prev, { email: email.trim(), rol }]);
      setEmail('');
    } catch {
      setError('No se pudo enviar la invitación. Revisa el correo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="orion-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-mono tracking-widest text-muted-foreground">PASO 2 · EQUIPO Y PERFILES</span>
      </div>

      <div className="mb-5">
        <label className="text-xs font-mono mb-1 block text-muted-foreground">Tu cargo en la empresa *</label>
        <select
          value={miCargo}
          onChange={e => setMiCargo(e.target.value)}
          className="w-full sm:w-72 px-3 py-2.5 rounded-lg text-sm bg-surface-raised border border-hairline text-foreground"
        >
          <option value="">Selecciona tu cargo...</option>
          {CARGOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="mb-2">
        <label className="text-xs font-mono mb-1 block text-muted-foreground">Invitar al equipo (opcional)</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@empresa.cl"
            type="email"
            className="flex-1 px-3 py-2.5 rounded-lg text-sm bg-surface-raised border border-hairline text-foreground"
          />
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
        {error && <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--danger))' }}>{error}</p>}
      </div>

      {invitados.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {invitados.map((i, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: 'hsl(var(--ok))' }} />
              {i.email} · {i.rol === 'admin' ? 'Administrador' : 'Usuario'} · invitado
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground mb-5">Cada invitado define su cargo al ingresar por primera vez.</p>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-5 py-3 rounded-xl text-sm text-muted-foreground bg-surface-raised border border-hairline">← Atrás</button>
        <button onClick={onNext} disabled={!miCargo}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-40">
          Continuar → Primera obra
        </button>
      </div>
    </div>
  );
}