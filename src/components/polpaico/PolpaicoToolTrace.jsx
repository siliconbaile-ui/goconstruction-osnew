import { Check, Loader2, AlertCircle } from 'lucide-react';
export default function PolpaicoToolTrace({ tool }) {
  let parsed = tool.results;
  if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch { /* texto sin estructura */ } }
  const failed = ['failed','error'].includes(tool.status) || parsed?.success === false || Boolean(parsed?.error) || /error|failed/i.test(typeof tool.results === 'string' ? tool.results : '');
  const busy = ['pending','running','in_progress'].includes(tool.status);
  const p = tool.display_projection;
  const label = p?.hide_details && p?.details_redacted ? (failed ? p.error_label : busy ? p.active_label : p.label) : failed ? 'No se pudo completar la operación' : busy ? 'GO está consultando o procesando registros…' : 'Resultado recibido de la herramienta';
  const Icon = failed ? AlertCircle : busy ? Loader2 : Check;
  return <div className={`flex items-center gap-2 text-[11px] py-2 ${failed ? 'text-danger' : 'text-muted-foreground'}`}><Icon className={`w-3.5 h-3.5 shrink-0 ${busy ? 'animate-spin' : ''}`} />{label || 'Operación del agente'}</div>;
}