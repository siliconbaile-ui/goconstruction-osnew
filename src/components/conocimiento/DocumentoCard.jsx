import { FileText, Loader2, CheckCircle, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';
import OrionCard from '@/components/OrionCard';

const ESTADO = {
  pendiente: { label: 'PENDIENTE', color: '#F39C12', icon: AlertTriangle },
  indexando: { label: 'INDEXANDO', color: '#5B8DEF', icon: Loader2 },
  indexado: { label: 'INDEXADO', color: '#27AE60', icon: CheckCircle },
  error: { label: 'ERROR', color: '#D35400', icon: AlertTriangle },
};

export default function DocumentoCard({ doc, onDelete, onReindexar }) {
  const meta = ESTADO[doc.estado_indexacion] || ESTADO.pendiente;
  const Icon = meta.icon;

  return (
    <OrionCard className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,51,153,0.15)' }}>
          <FileText className="w-4 h-4" style={{ color: '#5B8DEF' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-white truncate">{doc.titulo}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border bg-slate-500/10 text-slate-400 border-slate-500/30">
              {doc.tipo?.toUpperCase()}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border bg-blue-500/10 text-blue-400 border-blue-500/30">
              {doc.especialidad?.toUpperCase()}
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: meta.color }}>
              <Icon className={`w-3 h-3 ${doc.estado_indexacion === 'indexando' ? 'animate-spin' : ''}`} />
              {meta.label}
            </span>
          </div>
          {doc.resumen && <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#4A6FA5' }}>{doc.resumen}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 font-mono text-[10px]" style={{ color: '#2D4A6E' }}>
            {doc.paginas_totales ? <span>{doc.paginas_totales} pág.</span> : null}
            {doc.version && <span>v{doc.version}</span>}
            {doc.nombre_archivo && <span className="truncate max-w-[180px]">{doc.nombre_archivo}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-white/5" style={{ color: '#4A6FA5' }} title="Abrir documento">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => onDelete(doc.id)} className="p-1.5 rounded hover:bg-white/5" style={{ color: '#4A6FA5' }} title="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {doc.estado_indexacion === 'error' && (
        <button onClick={() => onReindexar(doc)} className="mt-3 px-3 py-1.5 rounded text-[10px] font-mono text-white" style={{ background: '#003399' }}>
          Reintentar indexación
        </button>
      )}
    </OrionCard>
  );
}