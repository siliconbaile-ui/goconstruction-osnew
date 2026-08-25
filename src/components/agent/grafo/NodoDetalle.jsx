import { X } from 'lucide-react';
import { metaTipo, SEVERIDAD, REL_LABEL } from './metaGrafo';

// Ficha del nodo seleccionado: qué es, cómo está y con qué se conecta.
export default function NodoDetalle({ nodo, vecinos, onCerrar, onFocar }) {
  const meta = metaTipo(nodo.tipo);
  const Icon = meta.icon;

  return (
    <div className="rounded-xl p-3 bg-surface border border-hairline min-w-0">
      <div className="flex items-start gap-2 mb-2">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}22` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-mono tracking-widest text-muted-foreground">{meta.label.toUpperCase()}</span>
          <span className="block text-xs font-semibold text-foreground break-words">{nodo.label}</span>
        </span>
        <button onClick={onCerrar} className="p-1 flex-shrink-0">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEVERIDAD[nodo.severidad] || SEVERIDAD.ok }} />
        <span className="text-[11px] text-muted-foreground break-words">{nodo.detalle || 'Sin detalle registrado'}</span>
      </div>

      {vecinos.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-hairline">
          <div className="text-[9px] font-mono tracking-widest text-muted-foreground mb-1">
            {vecinos.length} CONEXIÓN{vecinos.length !== 1 ? 'ES' : ''}
          </div>
          {vecinos.slice(0, 6).map((v, i) => {
            const m = metaTipo(v.nodo.tipo);
            return (
              <button key={i} onClick={() => onFocar(v.nodo.id)}
                className="w-full text-left flex items-start gap-1.5 text-[11px] min-w-0">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: m.color }} />
                <span className="min-w-0">
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {v.direccion === 'sale' ? '' : '← '}{REL_LABEL[v.rel] || v.rel.toLowerCase()}{v.direccion === 'sale' ? ' →' : ''}
                  </span>{' '}
                  <span className="text-foreground break-words">{v.nodo.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}