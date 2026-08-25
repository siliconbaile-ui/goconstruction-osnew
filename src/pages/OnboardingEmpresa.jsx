import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/marca/Logo';
import PasoEmpresa from '@/components/onboarding/PasoEmpresa';
import PasoEquipo from '@/components/onboarding/PasoEquipo';
import PasoObra from '@/components/onboarding/PasoObra';

const PASOS = ['Empresa', 'Equipo', 'Primera obra'];
const DEMO_ID = '6a8538b131a67708e1537f96';

// Onboarding para incorporar una constructora real: datos de la empresa,
// equipo con cargos, y primera obra (propia o demo para partir probando).
export default function OnboardingEmpresa() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [empresa, setEmpresa] = useState(null);
  const [form, setForm] = useState({});
  const [miCargo, setMiCargo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      if (user.empresa_id) {
        const emps = await base44.entities.Empresa.filter({ id: user.empresa_id });
        const emp = emps[0];
        if (emp?.onboarding_completado) { navigate('/configuracion'); return; }
        if (emp) { setEmpresa(emp); setForm(emp); setPaso(emp.onboarding_paso || 1); }
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
    await base44.auth.updateMe({ cargo: miCargo });
    await base44.entities.Empresa.update(empresa.id, { onboarding_paso: 3 });
    setPaso(3);
  };

  const finalizar = async (modo, obra) => {
    setGuardando(true);
    try {
      if (modo === 'nueva') {
        await base44.entities.ProyectoObra.create({
          ...obra,
          empresa_id: empresa.id,
          estado: 'configuracion',
          herramienta_calidad: 'csv',
        });
      } else {
        await base44.entities.ProyectoObra.update(DEMO_ID, { es_demo: true, estado: 'activo' });
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
        <h1 className="text-xl font-bold text-foreground">Incorpora tu constructora</h1>
        <p className="text-sm text-muted-foreground mt-1">Tres pasos y GO queda operando tu obra.</p>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2">
        {PASOS.map((p, i) => (
          <div key={p} className="flex-1">
            <div className="h-1.5 rounded-full mb-1.5"
              style={{ background: paso > i ? 'hsl(var(--primary))' : 'hsl(var(--hairline))' }} />
            <span className={`text-[10px] font-mono ${paso === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}. {p.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {paso === 1 && <PasoEmpresa form={form} setForm={setForm} onNext={guardarEmpresa} guardando={guardando} />}
      {paso === 2 && <PasoEquipo miCargo={miCargo} setMiCargo={setMiCargo} onNext={guardarEquipo} onBack={() => setPaso(1)} />}
      {paso === 3 && <PasoObra onFinish={finalizar} onBack={() => setPaso(2)} guardando={guardando} />}
    </div>
  );
}