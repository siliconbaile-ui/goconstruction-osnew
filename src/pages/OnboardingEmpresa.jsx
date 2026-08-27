import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/marca/Logo';
import RelatoPaso from '@/components/onboarding/RelatoPaso';
import PasoTema from '@/components/onboarding/PasoTema';
import PasoEmpresa from '@/components/onboarding/PasoEmpresa';
import PasoEquipo from '@/components/onboarding/PasoEquipo';
import PasoObra from '@/components/onboarding/PasoObra';

const PASOS = ['Empresa', 'Equipo', 'Primera obra'];

// Onboarding para incorporar una constructora real: datos de la empresa,
// equipo con cargos, y primera obra (propia o demo para partir probando).
// Vive a pantalla completa, fuera del shell de la app: sin sidebar ni menús.
export default function OnboardingEmpresa() {
  const [paso, setPaso] = useState(1);
  const [empresa, setEmpresa] = useState(null);
  const [form, setForm] = useState({});
  const [miCargo, setMiCargo] = useState('');
  const [soloCargo, setSoloCargo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  // Antes de pedir datos, la constructora elige su paleta y su luz (una sola vez).
  const [eligiendoTema, setEligiendoTema] = useState(() => !localStorage.getItem('gco_tema_elegido'));
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
  const entrarAOperar = (destino = '/app') => { window.location.href = destino; };

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
      if (soloCargo) { entrarAOperar(); return; }
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
      entrarAOperar();
    } catch {
      setError('No se pudo activar la obra. Revisa los datos e inténtalo otra vez.');
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-base">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-base"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">

        {eligiendoTema ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
            <div className="flex justify-center pt-4"><Logo /></div>
            <div className="orion-panel orion-elevated p-5 sm:p-7">
              <PasoTema onNext={() => { localStorage.setItem('gco_tema_elegido', '1'); setEligiendoTema(false); }} />
            </div>
          </motion.div>
        ) : (
          <>
            <RelatoPaso paso={paso} total={PASOS.length} soloCargo={soloCargo} empresa={empresa} />

            {/* Indicador de pasos: círculos numerados con conectores */}
            {!soloCargo && (
              <div className="flex items-center justify-center gap-0">
                {PASOS.map((p, i) => {
                  const completado = paso > i + 1;
                  const activo = paso === i + 1;
                  return (
                    <div key={p} className="flex items-center">
                      {i > 0 && (
                        <div className={`w-8 sm:w-14 h-px ${paso > i ? 'bg-primary' : 'bg-hairline'}`} />
                      )}
                      <div className="flex flex-col items-center gap-1.5 px-1.5">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-colors ${
                          completado ? 'bg-primary border-primary text-primary-foreground'
                          : activo ? 'border-primary text-primary bg-primary/10'
                          : 'border-hairline text-muted-foreground bg-surface'}`}>
                          {completado ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </span>
                        <span className={`text-[10px] font-mono tracking-wide ${activo ? 'text-primary' : 'text-muted-foreground'}`}>
                          {p.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl text-xs border"
                style={{ borderColor: 'hsl(var(--danger) / 0.4)', background: 'hsl(var(--danger) / 0.08)', color: 'hsl(var(--danger))' }}>
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={paso}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                {paso === 1 && <PasoEmpresa form={form} setForm={setForm} onNext={guardarEmpresa} guardando={guardando} />}
                {paso === 2 && <PasoEquipo miCargo={miCargo} setMiCargo={setMiCargo} onNext={guardarEquipo} onBack={soloCargo ? null : () => setPaso(1)} guardando={guardando} soloCargo={soloCargo} />}
                {paso === 3 && <PasoObra onFinish={finalizar} onBack={() => setPaso(2)} guardando={guardando} />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}