import { Moon, Sun, Check, ArrowRight } from 'lucide-react';
import useTemaMarca from '@/hooks/useTemaMarca';

// Primer contacto con la marca: la constructora elige su paleta y su luz
// antes de entrar a operar. Se aplica en vivo sobre toda la interfaz.
export default function PasoTema({ onNext }) {
  const { temaId, modo, aplicar, setModo, temas } = useTemaMarca();

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-mono tracking-widest text-primary mb-1">PASO 0 · TU IDENTIDAD EN PANTALLA</div>
        <h2 className="text-lg font-semibold text-foreground">Elige cómo se ve tu command center</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Turnos de noche o terreno a pleno sol piden luces distintas. Cámbialo cuando quieras desde el manual de marca.
        </p>
      </div>

      {/* Luz */}
      <div className="flex gap-2">
        {[
          { key: 'dark', label: 'Oscuro', sub: 'sala de operación', icon: Moon },
          { key: 'light', label: 'Claro', sub: 'terreno a pleno sol', icon: Sun },
        ].map(m => {
          const Icon = m.icon;
          const activo = modo === m.key;
          return (
            <button key={m.key} onClick={() => setModo(m.key)}
              className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-colors ${
                activo ? 'border-primary bg-surface-raised' : 'border-hairline bg-surface'}`}>
              <Icon className={`w-4 h-4 ${activo ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{m.label}</span>
                <span className="block text-[10px] text-muted-foreground truncate">{m.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Paletas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {temas.map(t => {
          const activo = temaId === t.id;
          return (
            <button key={t.id} onClick={() => aplicar(t.id)}
              className={`text-left p-3.5 rounded-xl border transition-colors ${
                activo ? 'border-primary bg-surface-raised' : 'border-hairline bg-surface hover:border-primary/40'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground flex-1 truncate">{t.nombre}</span>
                {activo && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </div>
              <div className="flex gap-1 mb-2">
                {t.swatches[modo].map((c, i) => (
                  <span key={i} className="w-6 h-6 rounded-md border border-hairline" style={{ background: c }} />
                ))}
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground line-clamp-2">{t.uso}</p>
            </button>
          );
        })}
      </div>

      <button onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
        Continuar con estos colores <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}