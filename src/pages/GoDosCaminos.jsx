import { useState } from 'react';
import { Link } from 'react-router-dom';
import GoDosCaminosChat from '@/components/publicgo/GoDosCaminosChat';

export default function GoDosCaminos() {
  const [modo, setModo] = useState(new URLSearchParams(window.location.search).get('modo') === 'avanzar' ? 'avanzar' : 'consulta');
  return <main className="flex h-[100dvh] flex-col bg-surface-base text-foreground">
    <header className="border-b border-hairline bg-surface p-3 sm:p-4"><div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3"><Link to="/" className="text-sm font-bold">GO · GoConstruction OS</Link><div role="tablist" aria-label="Elige cómo conversar con GO" className="ml-auto flex gap-1 rounded-xl bg-surface-raised p-1"><button role="tab" aria-selected={modo === 'consulta'} onClick={() => setModo('consulta')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${modo === 'consulta' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Consulta técnica</button><button role="tab" aria-selected={modo === 'avanzar'} onClick={() => setModo('avanzar')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${modo === 'avanzar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Avanzar con mi empresa</button></div></div></header>
    <div className={modo === 'consulta' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}><GoDosCaminosChat agentName="go_vendedor" /></div>
    <div className={modo === 'avanzar' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}><GoDosCaminosChat agentName="go_incorporacion" /></div>
  </main>;
}