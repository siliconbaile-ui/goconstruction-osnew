import { Clock, ArrowUpCircle, CheckCircle, Eye, Archive, Loader2 } from 'lucide-react';
import OrionCard from '@/components/OrionCard';
import { NIVEL_STYLE, TIPO_META, ROL_LABEL, ESTADO_STYLE, iconoTipo } from '@/lib/alertaMeta';

export default function AlertaRow({ alerta, partida, horas, busy, onReconocer, onResolver, onEscalar, onArchivar }) {
  const nivel = NIVEL_STYLE[alerta.nivel] || NIVEL_STYLE.info;
  const estado = ESTADO_STYLE[alerta.estado] || ESTADO_STYLE.activa;
  const Icon = iconoTipo(alerta.tipo);
  const abierta = ['activa', 'reconocida'].includes(alerta.estado);
  const stale = abierta && horas >= 24;

  return (
    <OrionCard className="p-4" style={{ borderColor: nivel.border }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: nivel.bg, border: `1px solid ${nivel.border}` }}>
          <Icon className="w-4 h-4" style={{ color: nivel.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: nivel.bg, color: nivel.color, border: `1px solid ${nivel.border}` }}>
              {nivel.label}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#4A6FA5' }}>
              {TIPO_META[alerta.tipo]?.label || alerta.tipo}
            </span>
            {alerta.escalada && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1" style={{ background: 'rgba(211,84,0,0.1)', color: '#D35400', border: '1px solid rgba(211,84,0,0.3)' }}>
                <ArrowUpCircle className="w-3 h-3" /> ESCALADA
              </span>
            )}
            {stale && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1" style={{ background: 'rgba(211,84,0,0.1)', color: '#D35400', border: '1px solid rgba(211,84,0,0.3)' }}>
                <Clock className="w-3 h-3" /> {Math.floor(horas)}H SIN RESPUESTA
              </span>
            )}
          </div>

          <div className="text-sm font-medium text-white leading-snug">{alerta.titulo}</div>
          {alerta.mensaje && <div className="text-xs mt-1" style={{ color: '#7A97BD' }}>{alerta.mensaje}</div>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] font-mono" style={{ color: '#4A6FA5' }}>
            <span>Destinatario: {ROL_LABEL[alerta.destinatario_rol] || alerta.destinatario_rol}</span>
            {partida && <span>Partida: {partida.nombre}</span>}
            <span>Hace {horas < 1 ? '<1' : Math.floor(horas)}h</span>
          </div>

          {abierta && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #1E2D4A' }}>
              {alerta.estado === 'activa' && (
                <button onClick={() => onReconocer(alerta)} disabled={busy}
                  className="px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1 disabled:opacity-50"
                  style={{ background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.3)', color: '#F39C12' }}>
                  <Eye className="w-3 h-3" /> Reconocer
                </button>
              )}
              <button onClick={() => onResolver(alerta)} disabled={busy}
                className="px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1 disabled:opacity-50"
                style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27AE60' }}>
                <CheckCircle className="w-3 h-3" /> Resolver
              </button>
              {!alerta.escalada && alerta.destinatario_rol !== 'alta_direccion' && (
                <button onClick={() => onEscalar(alerta)} disabled={busy}
                  className="px-3 py-1.5 rounded text-xs font-mono text-white flex items-center gap-1 disabled:opacity-50"
                  style={{ background: '#003399' }}>
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpCircle className="w-3 h-3" />} Escalar
                </button>
              )}
              <button onClick={() => onArchivar(alerta)} disabled={busy}
                className="px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1 disabled:opacity-50"
                style={{ background: '#0A1628', border: '1px solid #1E2D4A', color: '#4A6FA5' }}>
                <Archive className="w-3 h-3" /> Archivar
              </button>
            </div>
          )}
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-mono flex-shrink-0" style={{ color: estado.color, border: `1px solid ${estado.color}55` }}>
          {estado.label}
        </span>
      </div>
    </OrionCard>
  );
}