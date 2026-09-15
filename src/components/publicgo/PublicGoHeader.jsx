import { Link } from 'react-router-dom';
import { Sparkles, Plus, PanelRight } from 'lucide-react';

export default function PublicGoHeader({ onReset, busy, showData, onToggleData }) {
  return (
    <header className="shrink-0 border-b border-hairline bg-surface px-3 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span>
          <div><h1 className="text-sm font-semibold">GO <span className="hidden sm:inline">· jefe técnico de obra</span></h1><p className="text-[10px] font-mono text-muted-foreground">GOCONSTRUCTION OS · DEMOSTRACIÓN</p></div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Link to="/login?returnTo=%2Fapp" className="flex min-h-11 items-center rounded-full border border-hairline px-4 text-xs font-semibold">Iniciar sesión</Link>
          <Link to="/register?returnTo=%2Fapp" className="flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground">Crear cuenta</Link>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="mr-auto text-xs text-muted-foreground">Sin cuenta · solo datos demo · sin cambios en obras reales</p>
        <button onClick={onToggleData} aria-expanded={showData} aria-controls="public-go-data" className="flex min-h-11 items-center gap-2 rounded-full bg-surface-raised px-3 text-xs"><PanelRight className="h-4 w-4" />Obra demo</button>
        <button onClick={onReset} disabled={busy} className="flex min-h-11 items-center gap-2 rounded-full bg-surface-raised px-3 text-xs disabled:opacity-40"><Plus className="h-4 w-4" />Nueva sesión</button>
      </div>
    </header>
  );
}