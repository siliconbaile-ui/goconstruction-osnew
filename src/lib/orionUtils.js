// Orion utility functions

export const COLORES = {
  azul: 'hsl(var(--primary))',
  alerta: 'hsl(var(--danger))',
  exito: 'hsl(var(--ok))',
  fondo: 'hsl(var(--surface-0))',
  superficie: 'hsl(var(--surface-1))',
  borde: 'hsl(var(--hairline))',
};

export function calcularDesviacion(avanceReal, avanceProgramado) {
  if (!avanceProgramado || avanceProgramado === 0) return 0;
  return ((avanceProgramado - avanceReal) / avanceProgramado) * 100;
}

export function semaforo(desviacion) {
  if (desviacion <= 0) return 'verde';
  if (desviacion <= 5) return 'amarillo';
  return 'rojo';
}

export function semaforoCalidad(estado) {
  const map = {
    aprobado: 'verde',
    pendiente: 'amarillo',
    rechazado: 'rojo',
    sin_inspeccion: 'gris',
  };
  return map[estado] || 'gris';
}

export function colorSemaforo(color) {
  const map = {
    verde: 'hsl(var(--ok))',
    amarillo: 'hsl(var(--warn))',
    rojo: 'hsl(var(--danger))',
    gris: 'hsl(var(--muted-foreground))',
    azul: 'hsl(var(--primary))',
  };
  return map[color] || map.gris;
}

// Chips legibles en ambos temas: base = claro, variante dark = oscuro.
export function bgSemaforo(color) {
  const map = {
    verde: 'bg-emerald-500/10 text-emerald-700 border-emerald-600/30 dark:text-emerald-400 dark:border-emerald-500/30',
    amarillo: 'bg-amber-500/10 text-amber-700 border-amber-600/30 dark:text-amber-400 dark:border-amber-500/30',
    rojo: 'bg-orange-600/10 text-orange-700 border-orange-600/30 dark:text-orange-400 dark:border-orange-500/30',
    gris: 'bg-slate-500/10 text-slate-600 border-slate-500/25 dark:text-slate-400 dark:border-slate-500/30',
    azul: 'bg-blue-600/10 text-blue-700 border-blue-600/30 dark:text-blue-400 dark:border-blue-500/30',
  };
  return map[color] || map.gris;
}

export function estadoPagoColor(estado) {
  const map = {
    borrador: bgSemaforo('azul'),
    bloqueado_calidad: bgSemaforo('rojo'),
    pendiente_firma: bgSemaforo('amarillo'),
    aprobado: bgSemaforo('verde'),
    rechazado: 'bg-red-500/10 text-red-700 border-red-600/30 dark:text-red-400 dark:border-red-500/30',
    pagado: 'bg-violet-500/10 text-violet-700 border-violet-600/30 dark:text-violet-400 dark:border-violet-500/30',
  };
  return map[estado] || bgSemaforo('gris');
}

export function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTimestamp(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function gravedadColor(gravedad) {
  const map = {
    leve: bgSemaforo('azul'),
    moderada: bgSemaforo('amarillo'),
    critica: bgSemaforo('rojo'),
  };
  return map[gravedad] || map.leve;
}

export function prioridadColor(prioridad) {
  const map = {
    baja: bgSemaforo('gris'),
    media: bgSemaforo('azul'),
    alta: bgSemaforo('amarillo'),
    critica: bgSemaforo('rojo'),
  };
  return map[prioridad] || map.media;
}