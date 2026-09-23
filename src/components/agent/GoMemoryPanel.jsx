import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import GoLinkControl from './GoLinkControl';
import GoMemoryHistory from './GoMemoryHistory';
import GoAppHistory from './GoAppHistory';

export default function GoMemoryPanel({ onClose }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const refresh = async () => {
    try {
      const { data } = await base44.functions.invoke('memoriaGo', { accion: 'estado' });
      setStatus(data); setError('');
    } catch { setError('No se pudo consultar la vinculación.'); }
  };
  useEffect(() => { refresh(); }, []);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-3" role="dialog" aria-modal="true" aria-label="Memoria de GO">
    <div className="flex w-full max-w-xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-base text-foreground shadow-xl">
      <header className="flex items-center justify-between border-b border-hairline p-4"><div><h2 className="text-lg font-semibold">Memoria de GO</h2><p className="text-xs text-muted-foreground">Historial de la app y del WhatsApp vinculado.</p></div><button onClick={onClose} aria-label="Cerrar memoria" className="rounded-lg p-2 text-foreground hover:bg-surface"><X className="h-5 w-5" /></button></header>
      <div className="space-y-5 overflow-y-auto p-4">
        {!status && !error && <p className="text-sm text-muted-foreground">Cargando memoria…</p>}
        {error && <p role="alert" className="text-sm text-danger">{error} <button onClick={refresh} className="underline">Reintentar</button></p>}
        {status && <><GoLinkControl status={status} onRefresh={refresh} /><GoAppHistory />{status.vinculado && <GoMemoryHistory />}</>}
      </div>
    </div>
  </div>;
}