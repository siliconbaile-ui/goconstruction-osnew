import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import ChatVisitante from '@/components/visitante/ChatVisitante';
import PanelIzquierdo from '@/components/visitante/PanelIzquierdo';
import PanelVistaPrevia from '@/components/visitante/PanelVistaPrevia';
import FooterPublico from '@/components/marca/FooterPublico';
import PruebaValor from '@/components/visitante/PruebaValor';
import OtrosCasos from '@/components/landing/OtrosCasos';

// Página pública agentic-conversacional estilo youify.lat:
// el chat de GO ES la página. Layout de tres columnas en desktop,
// apilado en móvil. Sin scroll para lo esencial.
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
    <div className="min-h-[100dvh] bg-surface-base text-foreground flex flex-col">
      {/* LAYOUT AGENTIC · 3 columnas en desktop, apilado en móvil */}
      <section className="h-[100dvh] flex flex-col lg:flex-row" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <PanelIzquierdo etapa={1} />

        {/* Centro · el chat de GO es el protagonista */}
        <main className="flex-1 min-h-0 flex flex-col">
          {/* Header del agente */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full flex items-center justify-center bg-primary flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground">GO · agente técnico</div>
                <div className="font-mono text-[10px] text-muted-foreground">command center · obra</div>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-ok/10 text-ok border border-ok/20">
              <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
              EN VIVO · ATENDIENDO
            </span>
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0 p-3 sm:p-4">
            <ChatVisitante alto="100%" />
          </div>
        </main>

        <PanelVistaPrevia />
      </section>

      {/* Bajo el pliegue: prueba de valor y enlazado interno */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <PruebaValor />
        <OtrosCasos actual="" />
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link to="/demo" className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
            Ver demo con obra cargada
          </Link>
          <Link to="/register" className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border border-hairline bg-surface-raised text-foreground">
            Crear cuenta
          </Link>
        </div>
        <FooterPublico />
      </div>
    </div>
  );
}