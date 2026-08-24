import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Bell, ShieldAlert, Wallet, ClipboardList, Zap } from 'lucide-react';
import BloquePrioridad from '@/components/urgente/BloquePrioridad';

const hoy = () => new Date().toISOString().slice(0, 10);

export default function VisionUrgente() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [proyectos, alertas, ncs, edps, rdis] = await Promise.all([
        base44.entities.ProyectoObra.list('-updated_date', 1),
        base44.entities.AlertaSistema.filter({ estado: 'activa', nivel: 'critica' }, '-horas_sin_respuesta', 50),
        base44.entities.InspeccionCalidad.filter({ gravedad: 'critica', estado: { $in: ['abierta', 'en_revision'] } }, '-created_date', 50),
        base44.entities.EstadoPago.filter({ estado: 'bloqueado_calidad' }, '-monto_usd', 50),
        base44.entities.RequerimientoInformacion.filter({ estado: { $in: ['abierto', 'en_revision', 'vencido'] } }, 'fecha_vencimiento', 100),
      ]);
      const vencidos = rdis.filter(r => r.estado === 'vencido' || (r.fecha_vencimiento && r.fecha_vencimiento < hoy()) || !r.especialista_asignado);
      setData({ proyecto: proyectos[0] || null, alertas, ncs, edps, vencidos });
    })();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const { proyecto, alertas, ncs, edps, vencidos } = data;
  const umbral = proyecto?.umbral_desviacion ?? 5;
  const desviacion = proyecto?.avance_programado
    ? proyecto.avance_programado - (proyecto.avance_real || 0)
    : 0;
  const semaforo = desviacion > umbral ? 'danger' : desviacion > 0 ? 'warn' : 'ok';
  const semaforoTexto = semaforo === 'danger' ? '🔴 CRÍTICO' : semaforo === 'warn' ? '🟡 EN LÍMITE' : '🟢 EN PLAZO';
  const montoBloqueado = edps.reduce((s, e) => s + (e.monto_usd || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Semáforo de obra */}
      <div className="rounded-2xl border border-hairline bg-surface px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          <Zap className="w-3 h-3" style={{ color: 'hsl(var(--primary))' }} />
          VISIÓN URGENTE · LO QUE EXIGE DECISIÓN HOY
        </div>
        <h1 className="mt-1.5 text-lg sm:text-2xl font-bold text-foreground break-words">
          {proyecto?.nombre || 'Sin obra registrada'}
        </h1>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { k: 'ESTADO', v: semaforoTexto, tono: semaforo },
            { k: 'AVANCE REAL', v: `${(proyecto?.avance_real ?? 0).toFixed(1)}%` },
            { k: 'PROGRAMADO', v: `${(proyecto?.avance_programado ?? 0).toFixed(1)}%` },
            { k: 'DESVIACIÓN', v: `${desviacion.toFixed(1)} pts`, tono: semaforo },
          ].map(c => (
            <div key={c.k} className="rounded-xl bg-surface-raised px-3 py-2.5">
              <div className="font-mono text-[9px] tracking-wider text-muted-foreground">{c.k}</div>
              <div className="text-sm font-bold mt-0.5 break-words"
                style={{ color: c.tono ? `hsl(var(--${c.tono}))` : 'hsl(var(--foreground))' }}>
                {c.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BloquePrioridad
          icon={Bell} titulo="Alertas críticas escaladas" color="danger"
          conteo={alertas.length}
          impacto={`${alertas.filter(a => a.escalada).length} escaladas a dirección`}
          verMas="/centro-alertas"
          vacioTexto="Sin alertas críticas activas."
          filas={alertas.slice(0, 4).map(a => ({
            id: a.id, titulo: a.titulo,
            tono: a.escalada ? 'danger' : 'warn',
            detalle: `${a.horas_sin_respuesta || 0}h sin respuesta · ${a.destinatario_rol}`,
          }))}
        />

        <BloquePrioridad
          icon={Wallet} titulo="Pagos bloqueados por calidad" color="warn"
          conteo={edps.length}
          impacto={`USD ${montoBloqueado.toLocaleString('es-CL')} retenidos`}
          verMas="/semaforo-pagos"
          vacioTexto="Sin EDPs bloqueados."
          filas={edps.slice(0, 4).map(e => ({
            id: e.id,
            titulo: `${e.numero_edp || 'EDP'} · ${e.subcontratista || 'sin subcontratista'}`,
            detalle: `USD ${(e.monto_usd || 0).toLocaleString('es-CL')} · ${e.motivo_bloqueo || 'NC crítica abierta'}`,
            tono: 'warn',
          }))}
        />

        <BloquePrioridad
          icon={ShieldAlert} titulo="No conformidades críticas" color="danger"
          conteo={ncs.length}
          impacto="Bloquean partida y pago"
          verMas="/qa-terreno"
          vacioTexto="Sin NC críticas abiertas."
          filas={ncs.slice(0, 4).map(n => ({
            id: n.id,
            titulo: `${n.numero_correlativo || 'NC'} · ${n.descripcion || n.observacion || 'sin descripción'}`,
            detalle: `cierre ${n.fecha_limite_cierre || 'sin fecha'} · ${n.responsable || 'sin responsable'}`,
            tono: 'danger',
          }))}
        />

        <BloquePrioridad
          icon={ClipboardList} titulo="RDIs vencidos o sin especialista" color="warn"
          conteo={vencidos.length}
          impacto="Cada RDI mal gestionado cuesta USD 1.000"
          verMas="/gestor-rdi"
          vacioTexto="RDIs al día."
          filas={vencidos.slice(0, 4).map(r => ({
            id: r.id,
            titulo: `${r.numero_rdi || 'RDI'} · ${r.titulo}`,
            detalle: `vence ${r.fecha_vencimiento || 'sin fecha'} · ${r.especialista_asignado || 'SIN ESPECIALISTA'}`,
            tono: 'warn',
          }))}
        />
      </div>
    </div>
  );
}