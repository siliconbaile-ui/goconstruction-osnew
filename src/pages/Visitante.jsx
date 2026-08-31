import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PanelBlindaje from '@/components/visitante/PanelBlindaje';
import ChatCommandCenter from '@/components/visitante/ChatCommandCenter';
import PanelComando from '@/components/visitante/PanelComando';
import FooterPublico from '@/components/marca/FooterPublico';
import PruebaValor from '@/components/visitante/PruebaValor';
import OtrosCasos from '@/components/landing/OtrosCasos';

const AMBER = '#E8912E';

// Página pública · Command Center con glassmorphism de alta fidelidad.
// Tres columnas: Blindaje (izq) · Chat agéntico (centro) · Comando (der).
export default function Visitante() {
  const [estado, setEstado] = useState('verificando');
  const [consultaExterna, setConsultaExterna] = useState(null);
  const [demoData, setDemoData] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(ok => setEstado(ok ? 'autenticado' : 'visitante'))
      .catch(() => setEstado('visitante'));
    base44.functions.invoke('demoObra', {})
      .then(setDemoData)
      .catch(() => setDemoData(null));
  }, []);

  if (estado === 'verificando') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-base">
        <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
      </div>
    );
  }
  if (estado === 'autenticado') return <Navigate to="/app" replace />;

  return (
    <div className="command-center-bg min-h-[100dvh] text-foreground flex flex-col">
      {/* Elementos 3D de fondo (esferas mármol/mate para profundidad) */}
      <div className="sphere-1" />
      <div className="sphere-2" />

      {/* Layout · 3 columnas en desktop, stacking en móvil priorizando el chat */}
      <section className="h-[100dvh] flex flex-col lg:flex-row relative z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <PanelBlindaje data={demoData} />

        {/* Centro · Chat agéntico protagonista */}
        <main className="flex-1 min-h-0 flex flex-col p-3 sm:p-4">
          <ChatCommandCenter
            alto="100%"
            consultaExterna={consultaExterna}
            onConsultaConsumida={() => setConsultaExterna(null)}
          />
        </main>

        <PanelComando data={demoData} alConsultar={setConsultaExterna} />
      </section>

      {/* Bajo el pliegue */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <PruebaValor />
        <OtrosCasos actual="" />
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link to="/demo" className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
            Ver demo con obra cargada
          </Link>
          <Link to="/register" className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold" style={{ background: AMBER, color: '#fff' }}>
            Crear cuenta
          </Link>
        </div>
        <FooterPublico />
      </div>
    </div>
  );
}