import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, PlayCircle } from 'lucide-react';
import ChatVisitante from '@/components/visitante/ChatVisitante';
import PanelIzquierdo from '@/components/visitante/PanelIzquierdo';
import PanelVistaPrevia from '@/components/visitante/PanelVistaPrevia';
import FooterPublico from '@/components/marca/FooterPublico';
import PruebaValor from '@/components/visitante/PruebaValor';
import OtrosCasos from '@/components/landing/OtrosCasos';

const AMBER = '#E8912E';

const SALUDO = 'Soy GO. Te explico cómo funciona o puedes ver un demo con una obra real cargada. ¿Qué prefieres?';
const SUGERENCIAS = [
  '¿Qué hace exactamente la plataforma?',
  '¿Cómo bloquean un pago por calidad?',
  '¿Qué hago con una foto por WhatsApp?',
];

// Página pública · tres columnas agentic-conversacionales.
// El chat de GO es el protagonista en el centro.
export default function Visitante() {
  const [estado, setEstado] = useState('verificando');
  const [consultaExterna, setConsultaExterna] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(ok => setEstado(ok ? 'autenticado' : 'visitante'))
      .catch(() => setEstado('visitante'));
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
    <div className="min-h-[100dvh] bg-surface-base text-foreground flex flex-col">
      {/* LAYOUT · 3 columnas en desktop, apilado en móvil */}
      <section className="h-[100dvh] flex flex-col lg:flex-row" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <PanelIzquierdo />

        {/* Centro · Chat agéntico protagonista */}
        <main className="flex-1 min-h-0 flex flex-col">
          {/* Header del agente */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full flex items-center justify-center bg-primary flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground">GO · agente técnico</div>
                <div className="font-mono text-[10px] text-muted-foreground">command center · obra</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/demo" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground/80 hover:text-foreground">
                <PlayCircle className="w-3.5 h-3.5 text-primary" /> Ver demo
              </Link>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-ok/10 text-ok border border-ok/20">
                <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
                EN VIVO · ATENDIENDO
              </span>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0 p-3 sm:p-4">
            <ChatVisitante
              alto="100%"
              saludo={SALUDO}
              sugerencias={SUGERENCIAS}
              consultaExterna={consultaExterna}
              onConsultaConsumida={() => setConsultaExterna(null)}
            />
          </div>
        </main>

        <PanelVistaPrevia alConsultar={setConsultaExterna} />
      </section>

      {/* Bajo el pliegue */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <PruebaValor />
        <OtrosCasos actual="" />
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link to="/demo" className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
            Ver demo con obra cargada
          </Link>
          <Link to="/register"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold"
            style={{ background: AMBER, color: '#fff' }}>
            Crear cuenta
          </Link>
        </div>
        <FooterPublico />
      </div>
    </div>
  );
}