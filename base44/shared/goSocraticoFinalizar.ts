import { ESPEJO_GO, guardarSocraticoGo, exigirReglaAplicableGo, PERMISO_RELATO_GO } from './goSocraticoStore.ts';
const TIPOS = ['mapa_tarea', 'episodio', 'punto_decision', 'senal'];
function citaValida(texto, cita) { return typeof cita === 'string' && cita.trim().length > 0 && texto.includes(cita); }
export async function finalizarSocraticoGo(estado, salida, agentMessageId) {
  if (!estado) return null;
  const { base44, auditoria, registro, texto, valor, consentido, ronda, dia, espejo } = estado;
  const s = salida.socratico;
  if (!s || !Number.isInteger(s.acto) || s.acto < 0 || s.acto > 7) throw new Error('Falta un acto socrático válido.');
  if (s.acto >= 2 && !valor) throw new Error('No se puede capturar antes de FIRST_VALUE persistido.');
  if (!Array.isArray(s.capturas) || s.capturas.length > 5 || !Array.isArray(s.reglas_aplicadas) || s.reglas_aplicadas.length > 5) throw new Error('Contrato socrático inválido.');
  if ((s.pedir_historia || s.capturas.length || s.regla) && (!consentido || !valor)) throw new Error('Relato sin consentimiento específico o sin primer valor anterior.');
  if (s.pedir_historia && ronda && ronda.wamid !== registro.message_id) throw new Error('Ya hubo una ronda de captura hoy.');
  if (salida.cuerpo.includes(PERMISO_RELATO_GO) && (salida.cuerpo !== PERMISO_RELATO_GO || salida.opciones.length)) throw new Error('El consentimiento de relato debe ser una sola pregunta, sin botones.');
  for (const captura of s.capturas) {
    if (!TIPOS.includes(captura.tipo) || !citaValida(texto, captura.fuente_literal) || !captura.datos || Array.isArray(captura.datos)
      || Object.values(captura.datos).some(v => typeof v !== 'string' || !v.trim() || !captura.fuente_literal.includes(v))) throw new Error('La captura no está sustentada por una cita literal.');
  }
  if (s.regla) {
    const r = s.regla, fuente = r.fuente_literal;
    if (s.acto !== 5 || (!citaValida(texto, fuente) && !citaValida(espejo?.fuente_literal || '', fuente))
      || typeof r.condicion !== 'string' || !r.condicion.trim() || !fuente.includes(r.condicion)
      || typeof r.accion !== 'string' || !r.accion.trim() || !fuente.includes(r.accion)
      || typeof r.excepcion !== 'string' || (r.excepcion && !fuente.includes(r.excepcion))
      || salida.opciones.length !== 3 || ESPEJO_GO.some((t, i) => salida.opciones[i].titulo !== t)
      || !salida.cuerpo.includes(r.condicion) || !salida.cuerpo.includes(r.accion)
      || (r.excepcion ? !salida.cuerpo.includes(r.excepcion) : !/pendiente/i.test(salida.cuerpo))) throw new Error('Espejo sin fuente, límites o botones correctos.');
  } else if (salida.opciones.some(o => ESPEJO_GO.includes(o.titulo))) throw new Error('Botones de espejo sin regla asociada.');
  if (s.primer_valor && (!citaValida(texto, s.primer_valor.cita) || !citaValida(salida.cuerpo, s.primer_valor.resultado) || s.acto !== 1)) throw new Error('FIRST_VALUE requiere ayuda entregada y fuente literal, en acto 1.');
  if (s.integracion && (!citaValida(texto, s.integracion.fuente_literal) || !citaValida(s.integracion.fuente_literal, s.integracion.servicio) || !citaValida(s.integracion.fuente_literal, s.integracion.motivo))) throw new Error('Propuesta de conexión sin fuente.');
  if (s.reglas_aplicadas.length && !consentido) throw new Error('No se usan reglas sin consentimiento vigente.');
  for (const id of s.reglas_aplicadas) await exigirReglaAplicableGo(base44, auditoria, id);
  const creados = [], obra = salida.seguimiento?.obra_declarada || '';
  if (s.primer_valor && !valor) creados.push(await guardarSocraticoGo(base44, auditoria, 'FIRST_VALUE', { ...s.primer_valor,
    ayuda_preparada: true, salida_simulada_persistida: false, utilidad_confirmada_por_persona: false, agent_message_id: agentMessageId,
    segundos_desde_ingreso: Math.max(0, (Date.now() - Date.parse(auditoria.persona.created_date)) / 1000),
    referencia_tiempo: 'created_date_servidor' },
    { clave: `${auditoria.persona.contacto_clave}:FIRST_VALUE`, fuente: s.primer_valor.cita, obra }));
  if (s.pedir_historia) creados.push(await guardarSocraticoGo(base44, auditoria, 'ronda_captura', { acto: s.acto, pregunta_literal: salida.cuerpo },
    { clave: `${auditoria.persona.contacto_clave}:captura:${dia}`, dia, fuente: salida.cuerpo, obra }));
  for (let i = 0; i < s.capturas.length; i++) { const c = s.capturas[i]; creados.push(await guardarSocraticoGo(base44, auditoria, c.tipo, c.datos, { paso: String(i), fuente: c.fuente_literal, obra })); }
  if (s.regla) {
    const nueva = await guardarSocraticoGo(base44, auditoria, 'regla_obra', { ...s.regla, agent_message_id: agentMessageId,
      vinculacion_operacional: 'pendiente', permiso_operacional: false }, { estado: 'propuesta', fuente: s.regla.fuente_literal,
      anterior_id: espejo?.id || '', version: (espejo?.version || 0) + 1, obra });
    creados.push(nueva);
    if (espejo && espejo.id !== nueva.id) await base44.entities.ConocimientoObraGO.update(espejo.id, { estado: 'retirada', datos: { ...espejo.datos, sustituida_por: nueva.id } });
  }
  if (s.integracion) creados.push(await guardarSocraticoGo(base44, auditoria, 'integracion_propuesta', { ...s.integracion, conectada: false }, { estado: 'propuesta', fuente: s.integracion.fuente_literal, obra }));
  await auditoria.registrar('transicion', { evento: 'ACTO_SOCRATICO', acto: s.acto, first_value_previo: valor?.id || null, ronda_dia: dia,
    registros: creados.map(r => ({ entidad: 'ConocimientoObraGO', id: r.id, tipo: r.tipo, estado: r.estado, wamid: r.wamid })) }, 'acto_socratico');
  return { acto: s.acto, registros: creados.map(r => ({ entidad: 'ConocimientoObraGO', id: r.id, tipo: r.tipo, estado: r.estado, wamid: r.wamid })), decision_espejo: estado.contexto.decision_espejo };
}