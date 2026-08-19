// Orion utility functions

export const COLORES = {
  azul: '#003399',
  alerta: '#D35400',
  exito: '#27AE60',
  fondo: '#0A0F1E',
  superficie: '#0D1526',
  borde: '#1E2D4A',
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
    verde: '#27AE60',
    amarillo: '#F39C12',
    rojo: '#D35400',
    gris: '#7F8C8D',
    azul: '#003399',
  };
  return map[color] || map.gris;
}

export function bgSemaforo(color) {
  const map = {
    verde: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amarillo: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rojo: 'bg-orange-600/10 text-orange-400 border-orange-500/30',
    gris: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    azul: 'bg-blue-600/10 text-blue-400 border-blue-500/30',
  };
  return map[color] || map.gris;
}

export function estadoPagoColor(estado) {
  const map = {
    borrador: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    bloqueado_calidad: 'bg-orange-600/10 text-orange-400 border-orange-500/30',
    pendiente_firma: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    aprobado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rechazado: 'bg-red-500/10 text-red-400 border-red-500/30',
    pagado: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };
  return map[estado] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
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
    leve: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    moderada: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    critica: 'bg-orange-600/10 text-orange-400 border-orange-500/30',
  };
  return map[gravedad] || map.leve;
}

export function prioridadColor(prioridad) {
  const map = {
    baja: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    media: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    alta: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    critica: 'bg-orange-600/10 text-orange-400 border-orange-500/30',
  };
  return map[prioridad] || map.media;
}