import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PlayCircle } from 'lucide-react';
import Logo from '@/components/marca/Logo';
import ChatVisitante from '@/components/visitante/ChatVisitante';
import FooterPublico from '@/components/marca/FooterPublico';
import PruebaValor from '@/components/visitante/PruebaValor';
import OtrosCasos from '@/components/landing/OtrosCasos';

// MODO 1 · VISITANTE: hero a pantalla completa con el chat de GO como
// protagonista. Sin scroll para lo esencial; el detalle vive bajo el pliegue.
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
    <div className="min-h-[100dvh] bg-surface-base text-foreground">
      {/* HERO · cabe completo en el viewport */}
      <section className="h-[100dvh] flex flex-col"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <header className="flex-shrink-0 w-full max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <Logo tamano="sm" conBajada={false} />
          <nav className="flex items-center gap-2">
            <Link to="/demo"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-foreground/80 hover:text-foreground">
              <PlayCircle className="w-3.5 h-3.5 text-primary" /> Ver demo
            </Link>
            <Link to="/login"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-hairline bg-surface-raised text-foreground">
              Iniciar sesión
            </Link>
            <Link to="/register"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground">
              Registrarse
            </Link>
          </nav>
        </header>

        <div className="flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 pb-4 flex flex-col gap-4">
          <div className="flex-shrink-0 text-center pt-2 sm:pt-4">
            <h1 className="text-xl sm:text-3xl font-bold leading-tight">
              El jefe técnico digital de tu obra.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-xl mx-auto">
              Avance, calidad, RDIs y estados de pago con criterio técnico, para constructoras en Chile.
              Pregúntale a GO ahora — sin registro.
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatVisitante alto="100%" />
          </div>
        </div>
      </section>

      {/* Bajo el pliegue: prueba de valor y enlazado interno */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <PruebaValor />
        <OtrosCasos actual="" />
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link to="/demo"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
            <PlayCircle className="w-4 h-4" /> Ver demo con obra cargada
          </Link>
          <Link to="/register"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border border-hairline bg-surface-raised text-foreground">
            Crear cuenta
          </Link>
        </div>
        <FooterPublico />
      </div>
    </div>
  );
}