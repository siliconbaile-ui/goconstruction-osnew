import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/marca/Logo';
import PasoEmpresa from '@/components/onboarding/PasoEmpresa';
import PasoEquipo from '@/components/onboarding/PasoEquipo';
import PasoObra from '@/components/onboarding/PasoObra';

const PASOS = [
  { nombre: 'Empresa', titulo: 'Incorpora tu constructora', bajada: 'Con la razón social queda creada tu cuenta de empresa.' },
  { nombre: 'Tu cargo', titulo: '¿Cuál es tu cargo en la obra?', bajada: 'Define cómo te habla GO: terreno recibe qué hacer hoy, gerencia recibe plata y plazo.' },
  { nombre: 'Primera obra', titulo: 'Tu primera obra', bajada: 'Con una obra activa GO ya puede leer avance, calidad, RDIs y pagos.' },
];

// Onboarding en 3 pasos, a pantalla completa y sin scroll: empresa, cargo y
// primera obra. Todo lo demás (tema, equipo, perfil) se ajusta después.
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

  const actual = PASOS[paso - 1];

  return (
    <div className="h-[100dvh] flex flex-col bg-surface-base"
      style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Cabecera fija: marca + progreso */}
      <header className="flex-shrink-0 flex flex-col items-center gap-4 px-4 pt-2 pb-4">
        <Logo conBajada={false} />
        {!soloCargo && (
          <div className="flex items-center gap-2 w-full max-w-xs">
            {PASOS.map((p, i) => (
              <div key={p.nombre} className="flex-1 h-1 rounded-full overflow-hidden bg-hairline">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: paso > i ? '100%' : '0%' }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Contenido centrado, sin scroll en pantallas normales */}
      <main className="flex-1 min-h-0 overflow-y-auto flex items-start sm:items-center justify-center px-4">
        <div className="w-full max-w-lg pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={soloCargo ? 'solo-cargo' : paso}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-[10px] font-mono tracking-[0.2em] text-primary mb-2">
                  {soloCargo ? 'ACCESO AL EQUIPO' : `PASO ${paso} DE ${PASOS.length} · ${actual.nombre.toUpperCase()}`}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {soloCargo ? `Bienvenido a ${empresa?.nombre || 'tu constructora'}` : actual.titulo}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                  {soloCargo ? 'Declara tu cargo en obra y entras a operar de inmediato.' : actual.bajada}
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-xs border text-center"
                  style={{ borderColor: 'hsl(var(--danger) / 0.4)', background: 'hsl(var(--danger) / 0.08)', color: 'hsl(var(--danger))' }}>
                  {error}
                </div>
              )}

              <div className="orion-panel orion-elevated p-5 sm:p-7">
                {paso === 1 && <PasoEmpresa form={form} setForm={setForm} onNext={guardarEmpresa} guardando={guardando} />}
                {paso === 2 && <PasoEquipo miCargo={miCargo} setMiCargo={setMiCargo} onNext={guardarEquipo} onBack={soloCargo ? null : () => setPaso(1)} guardando={guardando} soloCargo={soloCargo} />}
                {paso === 3 && <PasoObra onFinish={finalizar} onBack={() => setPaso(2)} guardando={guardando} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}