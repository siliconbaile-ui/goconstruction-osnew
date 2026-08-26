import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// Puerta de entrada: nadie opera GO sin empresa configurada y cargo definido.
// Un usuario invitado hereda automáticamente la empresa ya activa y solo
// declara su cargo; una empresa nueva pasa por el wizard completo.
export default function GuardOnboarding() {
  const location = useLocation();
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    (async () => {
      try {
      const me = await base44.auth.me();
      let empresa = null;

      if (me.empresa_id) {
        const encontradas = await base44.entities.Empresa.filter({ id: me.empresa_id });
        empresa = encontradas[0] || null;
      } else {
        const activas = await base44.entities.Empresa.filter({ onboarding_completado: true }, '-created_date', 1);
        if (activas.length > 0) {
          empresa = activas[0];
          await base44.auth.updateMe({ empresa_id: empresa.id });
        }
      }

      const listo = !!empresa && empresa.onboarding_completado && !!me.cargo;
      setEstado(listo ? 'ok' : 'onboarding');
      } catch {
        // Nunca dejamos la pantalla pegada girando: se manda al onboarding.
        setEstado('onboarding');
      }
    })();
  }, []);

  if (estado === 'cargando') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-base">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (estado === 'onboarding' && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}