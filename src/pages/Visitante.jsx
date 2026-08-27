import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PlayCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import ChatVisitante from '@/components/visitante/ChatVisitante';
import FooterPublico from '@/components/marca/FooterPublico';
import PruebaValor from '@/components/visitante/PruebaValor';
import OtrosCasos from '@/components/landing/OtrosCasos';

// MODO 1 · VISITANTE: primera impresión sin login y sin datos de obra.
// Si ya hay sesión, se entra directo a operar.
export default function Visitante() {
  const [estado, setEstado] = useState('verificando');

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(ok => setEstado(ok ? 'autenticado' : 'visitante'))
      .catch(() => setEstado('visitante'));
  }, []);

  if (estado === 'verificando') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-base">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (estado === 'autenticado') return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14 space-y-6">
        <Logo size="lg" />

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">
            El jefe técnico digital de tu obra, hecho para constructoras en Chile.
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Control de avance, calidad, RDIs y estados de pago con criterio técnico. GO cita la página exacta de tus EETT,
            bloquea el pago cuando hay una NC crítica y recibe la foto del capataz por WhatsApp.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link to="/demo"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
            <PlayCircle className="w-4 h-4" /> Ver demo
          </Link>
          <Link to="/register"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border border-hairline bg-surface-raised text-foreground">
            Registrarse <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[11px] tracking-wider text-primary">HABLA CON GO AHORA</p>
          <ChatVisitante />
        </div>

        <PruebaValor />

        <OtrosCasos actual="" />

        <p className="text-[11px] font-mono text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary">Iniciar sesión</Link>
        </p>

        <FooterPublico />
      </div>
    </div>
  );
}