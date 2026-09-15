import { Link, useLocation } from 'react-router-dom';
import { Network } from 'lucide-react';
const areas = {
  '/monitor-avance': 'programacion', '/qa-terreno': 'calidad', '/evidencia-terreno': 'calidad',
  '/gestor-rdi': 'control', '/semaforo-pagos': 'costos', '/centro-alertas': 'control',
  '/base-conocimiento': 'conocimiento', '/informe-ejecutivo': 'informes',
  '/sincronizacion': 'conocimiento', '/dashboard': 'general', '/vision-urgente': 'general',
};
export default function GoAreaAccess() {
  const { pathname } = useLocation();
  const area = areas[pathname];
  if (!area) return null;
  return <Link to={`/app?go_area=${area}`} className="flex min-h-11 items-center gap-2 border-b border-hairline bg-surface px-4 text-xs text-primary"><Network className="h-4 w-4 shrink-0" />Revisar esta área con GO y su especialista<span className="ml-auto" aria-hidden="true">→</span></Link>;
}