const fields = {
  Terreno: ['id', 'proyecto_id', 'partida_id', 'numero_correlativo', 'descripcion', 'gravedad', 'estado', 'es_no_conformidad', 'coordenadas_gps'],
  RDIs: ['id', 'proyecto_id', 'numero_rdi', 'titulo', 'prioridad', 'estado', 'especialista_asignado', 'fecha_vencimiento'],
  Pagos: ['id', 'proyecto_id', 'partida_id', 'numero_edp', 'estado', 'motivo_bloqueo', 'calidad_verificada', 'monto_usd'],
  Alertas: ['id', 'proyecto_id', 'partida_id', 'titulo', 'nivel', 'estado', 'destinatario_rol', 'escalada', 'created_date'],
};

export default function goModuleInsights(area, records) {
  const active = records || [];
  const priorities = [];
  const add = (title, detail, prompt) => priorities.push({ title, detail, prompt });
  if (area === 'Terreno') {
    const nc = active.filter(i => i.es_no_conformidad && ['abierta', 'en_revision'].includes(i.estado));
    const gps = active.filter(i => !i.coordenadas_gps);
    if (nc.length) add(`${nc.length} no conformidad(es) abierta(s)`, 'Revisar hallazgos y evidencias antes de cualquier liberación.', `Analiza las no conformidades abiertas de terreno, empezando por ${nc[0].numero_correlativo || nc[0].id}. ¿Qué verificar primero?`);
    if (gps.length) add(`${gps.length} evidencia(s) sin GPS`, 'Verificar ubicación antes de asociarlas a un frente.', `Revisa las evidencias sin GPS, empezando por ${gps[0].id}. ¿Qué dato de ubicación falta?`);
  } else if (area === 'RDIs') {
    const vencidos = active.filter(r => r.estado === 'vencido' || (['abierto', 'en_revision'].includes(r.estado) && r.fecha_vencimiento && r.fecha_vencimiento < new Date().toISOString().slice(0, 10)));
    const sinAsignar = active.filter(r => ['abierto', 'en_revision'].includes(r.estado) && !r.especialista_asignado);
    if (vencidos.length) add(`${vencidos.length} RDI(s) vencido(s)`, 'Priorizar respuesta y evaluar el impacto en la obra.', `Revisa el RDI vencido ${vencidos[0].numero_rdi || vencidos[0].id}. ¿Qué falta para resolverlo?`);
    if (sinAsignar.length) add(`${sinAsignar.length} RDI(s) sin especialista`, 'Definir responsable antes de que se detenga la respuesta.', `Revisa el RDI sin asignar ${sinAsignar[0].numero_rdi || sinAsignar[0].id}. ¿Qué especialidad corresponde?`);
  } else if (area === 'Pagos') {
    const bloqueados = active.filter(e => e.estado === 'bloqueado_calidad');
    const firma = active.filter(e => e.estado === 'pendiente_firma');
    if (bloqueados.length) add(`${bloqueados.length} EDP(s) bloqueado(s)`, 'Revisar calidad y causa registrada; no liberar pagos desde la sugerencia.', `Analiza el bloqueo del EDP ${bloqueados[0].numero_edp || bloqueados[0].id}. ¿Qué evidencia de calidad falta?`);
    if (firma.length) add(`${firma.length} EDP(s) pendiente(s) de firma`, 'Verificar requisitos antes de la decisión humana.', `¿Qué verificar antes de decidir sobre el EDP ${firma[0].numero_edp || firma[0].id}? No apruebes ni firmes.`);
  } else if (area === 'Alertas') {
    const abiertas = active.filter(a => ['activa', 'reconocida'].includes(a.estado));
    const criticas = abiertas.filter(a => a.nivel === 'critica');
    const antiguas = abiertas.filter(a => a.created_date && Date.now() - new Date(a.created_date).getTime() >= 86400000);
    if (criticas.length) add(`${criticas.length} alerta(s) crítica(s)`, 'Revisar causa y responsable antes de escalar o resolver.', `Analiza la alerta crítica ${criticas[0].titulo} (${criticas[0].id}). ¿Cuál es el paso verificable?`);
    if (antiguas.length) add(`${antiguas.length} alerta(s) de más de 24 h`, 'Confirmar atención y decidir escalamiento con el responsable.', `Revisa la alerta de más de 24 horas ${antiguas[0].titulo} (${antiguas[0].id}). ¿Qué necesita el responsable?`);
  }
  const snapshot = JSON.stringify(active.slice(0, 15).map(record => Object.fromEntries(fields[area].filter(key => record[key] !== undefined).map(key => [key, record[key]]))));
  return { priorities, snapshot };
}