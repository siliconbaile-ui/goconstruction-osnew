import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import TarjetaPartidas from './panel/TarjetaPartidas';
import TarjetaPagos from './panel/TarjetaPagos';
import TarjetaAlertas from './panel/TarjetaAlertas';

// Panel central de control, servido dentro del mismo río de conversación:
// el estado de la obra es el primer turno del hilo, no otra pantalla.
export default function PanelControlRio({ onPrompt }) {
  const [datos, setDatos] = useState(null);
  const [abierto, setAbierto] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [partidas, edps, alertas] = await Promise.all([
          base44.entities.PartidaControl.list('-updated_date', 100),
          base44.entities.EstadoPago.list('-created_date', 30),
          base44.entities.AlertaSistema.filter({ estado: 'activa' }, '-created_date', 20),
        ]);
        setDatos({ partidas, edps, alertas });
      } catch {
        setDatos({ partidas: [], edps: [], alertas: [] });
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-primary">
          <LayoutDashboard className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">PANEL DE CONTROL · ESTADO DE LA OBRA AHORA</span>
        <button onClick={() => setAbierto(!abierto)} className="ml-auto p-1 text-muted-foreground">
          {abierto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {abierto && (
        !datos ? (
          <div className="flex items-center gap-2 px-4 py-6 rounded-2xl text-xs bg-surface border border-hairline text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Leyendo la obra...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <TarjetaPartidas partidas={datos.partidas} onPrompt={onPrompt} />
            <TarjetaPagos edps={datos.edps} onPrompt={onPrompt} />
            <TarjetaAlertas alertas={datos.alertas} onPrompt={onPrompt} />
          </div>
        )
      )}
    </div>
  );
}