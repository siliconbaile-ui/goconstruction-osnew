const TITLE_KEYS = ['titulo', 'nombre', 'numero_rdi', 'numero_edp', 'numero_correlativo', 'periodo', 'descripcion'];
const BADGE_KEYS = ['estado', 'nivel', 'prioridad', 'gravedad', 'estado_general', 'tipo', 'categoria', 'estado_calidad'];
const ROW_KEYS = [
  ['avance_real', 'Avance real', v => `${v}%`],
  ['avance_programado', 'Programado', v => `${v}%`],
  ['desviacion', 'Desviación', v => `${v}%`],
  ['monto_usd', 'Monto', v => `$${Number(v).toLocaleString()} USD`],
  ['monto_bloqueado_usd', 'Bloqueado', v => `$${Number(v).toLocaleString()} USD`],
  ['subcontratista', 'Subcontratista', v => v],
  ['responsable', 'Responsable', v => v],
  ['especialista_asignado', 'Asignado', v => v],
  ['inspector', 'Inspector', v => v],
  ['emisor', 'Emisor', v => v],
  ['fecha_vencimiento', 'Vence', v => v],
  ['fecha_limite_cierre', 'Límite cierre', v => v],
  ['mensaje', 'Detalle', v => v],
];

const CRITICO = ['critica', 'critico', 'vencido', 'bloqueado_calidad', 'rechazado', 'rechazada', 'rojo', 'bloqueada', 'alta'];
const OK = ['aprobado', 'aprobada', 'cerrado', 'cerrada', 'completada', 'verde', 'resuelta', 'pagado', 'respondido', 'leve', 'baja', 'info'];

function badgeStyle(valor) {
  const v = String(valor).toLowerCase();
  if (CRITICO.includes(v)) return { background: 'rgba(211,84,0,0.1)', color: '#C24A00', border: '1px solid rgba(211,84,0,0.3)' };
  if (OK.includes(v)) return { background: 'rgba(39,174,96,0.1)', color: '#1E8A4C', border: '1px solid rgba(39,174,96,0.3)' };
  return { background: '#F1F4FB', color: '#003399', border: '1px solid #DCE4F6' };
}

export default function SmartDataCard({ records }) {
  const visibles = records.slice(0, 6);
  const resto = records.length - visibles.length;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono tracking-widest" style={{ color: '#8A94A6' }}>
        {records.length} REGISTRO{records.length !== 1 ? 'S' : ''} · DATOS EN VIVO
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visibles.map((r, i) => {
          const titleKey = TITLE_KEYS.find(k => r[k]);
          const badges = BADGE_KEYS.filter(k => r[k] !== undefined && r[k] !== null && r[k] !== '').slice(0, 3);
          const rows = ROW_KEYS.filter(([k]) => r[k] !== undefined && r[k] !== null && r[k] !== '').slice(0, 4);
          return (
            <div key={r.id || i} className="rounded-xl p-3" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {badges.map(k => (
                  <span key={k} className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase" style={badgeStyle(r[k])}>
                    {String(r[k]).replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <div className="text-xs font-semibold leading-snug mb-1.5" style={{ color: '#141821' }}>
                {titleKey ? String(r[titleKey]).slice(0, 120) : r.id || '—'}
              </div>
              {rows.length > 0 && (
                <div className="space-y-0.5">
                  {rows.map(([k, label, fmt]) => (
                    <div key={k} className="flex justify-between gap-2 text-[10px]">
                      <span className="font-mono" style={{ color: '#A8B0BF' }}>{label}</span>
                      <span className="font-medium text-right truncate" style={{ color: '#41485A' }}>{String(fmt(r[k])).slice(0, 60)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {resto > 0 && (
        <div className="text-[10px] font-mono" style={{ color: '#A8B0BF' }}>+ {resto} registro(s) más — pídeme el detalle</div>
      )}
    </div>
  );
}