import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import MonitorAvance from '@/pages/MonitorAvance';
import QATerreno from '@/pages/QATerreno';
import GestorRDI from '@/pages/GestorRDI';
import SemaforoPagos from '@/pages/SemaforoPagos';
import Configuracion from '@/pages/Configuracion';
import AsistenteOrion from '@/pages/AsistenteOrion';
import CentroAlertas from '@/pages/CentroAlertas';
import SincronizacionDatos from '@/pages/SincronizacionDatos';
import InformeEjecutivo from '@/pages/InformeEjecutivo';
import BaseConocimiento from '@/pages/BaseConocimiento';
import EvidenciaTerreno from '@/pages/EvidenciaTerreno';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-base">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-muted-foreground">GOCONSTRUCTION OS · INICIALIZANDO...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AsistenteOrion />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/monitor-avance" element={<MonitorAvance />} />
        <Route path="/qa-terreno" element={<QATerreno />} />
        <Route path="/gestor-rdi" element={<GestorRDI />} />
        <Route path="/semaforo-pagos" element={<SemaforoPagos />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/asistente" element={<AsistenteOrion />} />
        <Route path="/centro-alertas" element={<CentroAlertas />} />
        <Route path="/sincronizacion" element={<SincronizacionDatos />} />
        <Route path="/informe-ejecutivo" element={<InformeEjecutivo />} />
        <Route path="/base-conocimiento" element={<BaseConocimiento />} />
        <Route path="/evidencia-terreno" element={<EvidenciaTerreno />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App