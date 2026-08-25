import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/marca/Logo';
import PasoEmpresa from '@/components/onboarding/PasoEmpresa';
import PasoEquipo from '@/components/onboarding/PasoEquipo';
import PasoObra from '@/components/onboarding/PasoObra';

const PASOS = ['Empresa', 'Equipo', 'Primera obra'];

// Onboarding para incorporar una constructora real: datos de la empresa,
// equipo con cargos, y primera obra (propia o demo para partir probando).
export default function OnboardingEmpresa() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [empresa, setEmpresa] = useState(null);
  const [form, setForm] = useState({});
  const [miCargo, setMiCargo] = useState('');
  const [soloCargo, setSoloCargo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
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
      setCargando(false);
    })();
  }, [navigate]);

  const guardarEmpresa = async () => {
    setGuardando(true);
    try {
      const datos = { nombre: form.nombre, rut: form.rut, giro: form.giro, direccion: form.direccion, telefono: form.telefono, email_contacto: form.email_contacto, onboarding_paso: 2 };
      let emp;
      if (empresa) {
        emp = await base44.entities.Empresa.update(empresa.id, datos);
      } else {
        emp = await base44.entities.Empresa.create(datos);
        await base44.auth.updateMe({ empresa_id: emp.id });
      }
      setEmpresa(emp);
      setPaso(2);
    } finally {
      setGuardando(false);
    }
  };

  const guardarEquipo = async () => {
    setGuardando(true);
    try {
      await base44.auth.updateMe({ cargo: miCargo });
      // Usuario invitado a una empresa ya operativa: con su cargo definido entra directo.
      if (soloCargo) { navigate('/'); return; }
      await base44.entities.Empresa.update(empresa.id, { onboarding_paso: 3 });
      setPaso(3);
    } finally {
      setGuardando(false);
    }
  };

  const finalizar = async (modo, obra) => {
    setGuardando(true);
    try {
      if (modo === 'nueva') {
        // La obra queda activa: la empresa puede operar con GO de inmediato.
        await base44.entities.ProyectoObra.create({
          ...obra,
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
      navigate(modo === 'nueva' ? '/configuracion' : '/');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="p-8 text-center font-mono text-xs text-muted-foreground">CARGANDO...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-5">
      <div className="text-center pt-2">
        <div className="flex justify-center mb-3"><Logo size="md" /></div>
        <h1 className="text-xl font-bold text-foreground">
          {soloCargo ? `Bienvenido a ${empresa?.nombre || 'tu constructora'}` : 'Incorpora tu constructora'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {soloCargo ? 'Declara tu cargo en obra y entras a operar.' : 'Tres pasos y GO queda operando tu obra.'}
        </p>
      </div>

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

      {paso === 1 && <PasoEmpresa form={form} setForm={setForm} onNext={guardarEmpresa} guardando={guardando} />}
      {paso === 2 && <PasoEquipo miCargo={miCargo} setMiCargo={setMiCargo} onNext={guardarEquipo} onBack={soloCargo ? null : () => setPaso(1)} guardando={guardando} soloCargo={soloCargo} />}
      {paso === 3 && <PasoObra onFinish={finalizar} onBack={() => setPaso(2)} guardando={guardando} />}
    </div>
  );
}