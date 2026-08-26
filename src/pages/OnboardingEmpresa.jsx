import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import RelatoPaso from '@/components/onboarding/RelatoPaso';
import PasoEmpresa from '@/components/onboarding/PasoEmpresa';
import PasoEquipo from '@/components/onboarding/PasoEquipo';
import PasoObra from '@/components/onboarding/PasoObra';

const PASOS = ['Empresa', 'Equipo', 'Primera obra'];

// Onboarding para incorporar una constructora real: datos de la empresa,
// equipo con cargos, y primera obra (propia o demo para partir probando).
export default function OnboardingEmpresa() {
  const [paso, setPaso] = useState(1);
  const [empresa, setEmpresa] = useState(null);
  const [form, setForm] = useState({});
  const [miCargo, setMiCargo] = useState('');
  const [soloCargo, setSoloCargo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user.empresa_id) {
          const emps = await base44.entities.Empresa.filter({ id: user.empresa_id });
          const emp = emps[0];
          if (emp) {
            setEmpresa(emp);
            setForm(emp);
            // Empresa ya operativa (usuario invitado): solo falta declarar su cargo.
            if (emp.onboarding_completado) { setSoloCargo(true); setPaso(2); }
            else setPaso(emp.onboarding_paso || 1);
          }
        }
        if (user.cargo) setMiCargo(user.cargo);
      } catch {
        setError('No pudimos cargar tu cuenta. Recarga la página para reintentar.');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  // Recarga completa: la puerta de onboarding vuelve a evaluar el estado real
  // y deja pasar a operar (con navigate() rebotaba de vuelta al wizard).
  const entrarAOperar = (destino = '/') => { window.location.href = destino; };

  const guardarEmpresa = async () => {
    setGuardando(true);
    setError('');
    try {
      const datos = { nombre: form.nombre, rut: form.rut, giro: form.giro, direccion: form.direccion, telefono: form.telefono, email_contacto: form.email_contacto, onboarding_paso: 2 };
      const emp = empresa
        ? await base44.entities.Empresa.update(empresa.id, datos)
        : await base44.entities.Empresa.create(datos);
      if (!empresa) await base44.auth.updateMe({ empresa_id: emp.id });
      setEmpresa(emp);
      setPaso(2);
    } catch {
      setError('No se pudo guardar la empresa. Revisa la razón social e inténtalo otra vez.');
    } finally {
      setGuardando(false);
    }
  };

  const guardarEquipo = async () => {
    setGuardando(true);
    setError('');
    try {
      await base44.auth.updateMe({ cargo: miCargo });
      // Usuario invitado a una empresa ya operativa: con su cargo definido entra directo.
      if (soloCargo) { entrarAOperar('/'); return; }
      await base44.entities.Empresa.update(empresa.id, { onboarding_paso: 3 });
      setPaso(3);
    } catch {
      setError('No se pudo guardar tu cargo. Inténtalo otra vez.');
      setGuardando(false);
      return;
    }
    setGuardando(false);
  };

  const finalizar = async (modo, obra) => {
    setGuardando(true);
    setError('');
    try {
      if (modo === 'nueva') {
        // Los campos vacíos se omiten: una fecha en blanco hacía fallar la creación.
        const limpios = Object.fromEntries(
          Object.entries(obra || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        );
        await base44.entities.ProyectoObra.create({
          ...limpios,
          empresa_id: empresa.id,
          estado: 'activo',
          herramienta_calidad: 'csv',
          administrador: form.nombre,
        });
      } else {
        const demos = await base44.entities.ProyectoObra.filter({ es_demo: true }, '-created_date', 1);
        if (demos.length > 0) {
          await base44.entities.ProyectoObra.update(demos[0].id, { estado: 'activo', empresa_id: empresa.id });
        } else {
          await base44.entities.ProyectoObra.create({
            nombre: 'Obra Demo · Edificio Corporativo',
            codigo: 'DEMO-01',
            empresa_id: empresa.id,
            estado: 'activo',
            es_demo: true,
            herramienta_calidad: 'csv',
          });
        }
      }
      await base44.entities.Empresa.update(empresa.id, {
        estado: modo === 'demo' ? 'demo' : 'activa',
        onboarding_completado: true,
      });
      entrarAOperar('/');
    } catch {
      setError('No se pudo activar la obra. Revisa los datos e inténtalo otra vez.');
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-5">
      <RelatoPaso paso={paso} total={PASOS.length} soloCargo={soloCargo} empresa={empresa} />

      {/* Indicador de pasos */}
      <div className={`flex items-center gap-2 ${soloCargo ? 'hidden' : ''}`}>
        {PASOS.map((p, i) => (
          <div key={p} className="flex-1">
            <div className="h-1.5 rounded-full mb-1.5"
              style={{ background: paso > i ? 'hsl(var(--primary))' : 'hsl(var(--hairline))' }} />
            <span className={`text-[10px] font-mono ${paso === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}. {p.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-xs border"
          style={{ borderColor: 'hsl(var(--danger) / 0.4)', background: 'hsl(var(--danger) / 0.08)', color: 'hsl(var(--danger))' }}>
          {error}
        </div>
      )}

      {paso === 1 && <PasoEmpresa form={form} setForm={setForm} onNext={guardarEmpresa} guardando={guardando} />}
      {paso === 2 && <PasoEquipo miCargo={miCargo} setMiCargo={setMiCargo} onNext={guardarEquipo} onBack={soloCargo ? null : () => setPaso(1)} guardando={guardando} soloCargo={soloCargo} />}
      {paso === 3 && <PasoObra onFinish={finalizar} onBack={() => setPaso(2)} guardando={guardando} />}
    </div>
  );
}