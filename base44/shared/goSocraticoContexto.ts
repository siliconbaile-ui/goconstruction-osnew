import { confirmarGo, negarGo, normalizarRespuestaGo } from './kapsoRegistroBase.ts';
import { alcanceSocraticoGo, guardarSocraticoGo, PERMISO_RELATO_GO } from './goSocraticoStore.ts';

export async function prepararSocraticoGo(base44, auditoria, registro, texto) {
  const scope = alcanceSocraticoGo(auditoria), db = base44.asServiceRole.entities.ConocimientoObraGO, registros = [];
  for (let skip = 0; ; skip += 100) {
    const pagina = await db.filter(scope, '-created_date', 100, skip);
    registros.push(...pagina);
    if (pagina.length < 100) break;
  }
  const directo = registro.tipo_mensaje === 'texto' && !registro.opcion_elegida;
  let permiso = registros.find(r => r.tipo === 'consentimiento');
  const retiro = directo && ['no guardes mis datos', 'retira mi consentimiento', 'olvida mi perfil'].includes(normalizarRespuestaGo(texto));
  const pregunta = auditoria.anterior?.resultado?.respuesta?.includes(PERMISO_RELATO_GO);
  if (retiro || (directo && pregunta && (confirmarGo(texto) || negarGo(texto)))) {
    permiso = await guardarSocraticoGo(base44, auditoria, 'consentimiento', {
      decision: retiro ? 'retirado' : confirmarGo(texto) ? 'aceptado' : 'rechazado',
      pregunta_literal: retiro ? '' : PERMISO_RELATO_GO, respuesta_literal: texto,
      audiencia: 'administradores', finalidad: 'retomar_relato_y_validar_reglas', auditoria_conservada: true
    }, { fuente: texto });
  }
  const consentido = permiso?.datos?.decision === 'aceptado';
  let espejo = registros.find(r => r.tipo === 'regla_obra' && r.estado === 'propuesta');
  const seleccion = /^go:([^:]+):([012])$/.exec(registro.opcion_elegida?.id || '');
  const reglaElegida = seleccion && registros.find(r => r.tipo === 'regla_obra' && r.datos?.agent_message_id === seleccion[1]);
  let decision = null;
  if (reglaElegida) {
    const repetida = registros.find(r => r.tipo === 'validacion' && r.wamid === registro.message_id && r.regla_id === reglaElegida.id);
    if (!repetida && (!consentido || reglaElegida.estado !== 'propuesta' || reglaElegida.id !== espejo?.id)) throw new Error('Espejo antiguo o sin consentimiento: no se modificó la regla.');
    decision = ['confirmada_autor', 'corregir', 'retirada'][Number(seleccion[2])];
    const validacion = await guardarSocraticoGo(base44, auditoria, 'validacion', { decision, regla_id: reglaElegida.id,
      boton_id: registro.opcion_elegida.id, autor_declarado: true, identidad_verificada: false },
      { fuente: registro.contenido_texto, regla_id: reglaElegida.id, validador: auditoria.persona.id });
    if (decision !== 'corregir') {
      await db.update(reglaElegida.id, { estado: decision, datos: { ...reglaElegida.datos, validacion_id: validacion.id } });
      espejo = null;
    }
  }
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(auditoria.turno.created_date));
  const valor = registros.find(r => r.tipo === 'FIRST_VALUE' && r.datos?.salida_simulada_persistida === true);
  const ronda = registros.find(r => r.tipo === 'ronda_captura' && r.dia_captura === dia);
  const contexto = { socratico_habilitado: true, entorno: auditoria.entorno, simulado: auditoria.simulado, first_value: valor?.id || null,
    consentimiento_relato: permiso?.datos?.decision || 'pendiente', dia_chile: dia,
    puede_pedir_historia: Boolean(valor && consentido && (!ronda || ronda.wamid === registro.message_id)),
    decision_espejo: decision, espejo_pendiente: consentido && espejo ? { id: espejo.id, ...espejo.datos, fuente_literal: espejo.fuente_literal } : null,
    reglas_aplicables: consentido ? registros.filter(r => r.tipo === 'regla_obra' && ['confirmada_autor', 'validada_otros'].includes(r.estado)).map(r => ({ id: r.id, estado: r.estado, ...r.datos })) : [],
    audiencia: 'solo administradores', vinculacion_privada: false };
  return { base44, auditoria, registro, texto, scope, registros, consentido, valor, ronda, dia, espejo, contexto };
}