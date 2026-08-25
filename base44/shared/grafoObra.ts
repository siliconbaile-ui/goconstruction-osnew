import { grafo } from './conocimiento.ts';

// Cerebro relacional de la obra en Neo4j. Los vectores encuentran texto; el
// grafo explica CÓMO se conecta la obra: qué NC bloquea qué EDP, qué RDI
// detiene qué partida, qué documento y norma gobiernan cada frente.
// Todo nodo se normaliza con id, label, detalle y severidad para poder
// dibujarlo y explicarlo sin lógica extra en el cliente.

const N = (v: unknown) => (v === null || v === undefined ? '' : String(v));

export async function sincronizarGrafo(base44: any, proyecto_id: string) {
  const [proyectos, partidas, inspecciones, rdis, edps, alertas, docs] = await Promise.all([
    base44.asServiceRole.entities.ProyectoObra.filter({ id: proyecto_id }),
    base44.asServiceRole.entities.PartidaControl.filter({ proyecto_id }, '-updated_date', 200),
    base44.asServiceRole.entities.InspeccionCalidad.filter({ proyecto_id }, '-updated_date', 200),
    base44.asServiceRole.entities.RequerimientoInformacion.filter({ proyecto_id }, '-updated_date', 200),
    base44.asServiceRole.entities.EstadoPago.filter({ proyecto_id }, '-updated_date', 200),
    base44.asServiceRole.entities.AlertaSistema.filter({ proyecto_id }, '-updated_date', 200),
    base44.asServiceRole.entities.DocumentoTecnico.filter({ proyecto_id }, '-updated_date', 100),
  ]);

  const obra = proyectos[0];
  if (!obra) throw new Error('Proyecto no encontrado');

  const desv = (p: any) => Number(p.avance_real || 0) - Number(p.avance_programado || 0);
  const sevPartida = (p: any) => {
    const u = Number(obra.umbral_desviacion || 5);
    const d = desv(p);
    if (d < -u) return 'critica';
    if (d < 0) return 'advertencia';
    return 'ok';
  };

  const nodos = [
    {
      id: `obra:${obra.id}`, tipo: 'Obra', label: obra.nombre,
      detalle: `Avance real ${obra.avance_real ?? 0}% vs programado ${obra.avance_programado ?? 0}%`,
      severidad: desv(obra) < -Number(obra.umbral_desviacion || 5) ? 'critica' : desv(obra) < 0 ? 'advertencia' : 'ok',
    },
    ...partidas.map((p: any) => ({
      id: `partida:${p.id}`, tipo: 'Partida', label: N(p.codigo ? `${p.codigo} · ${p.nombre}` : p.nombre),
      detalle: `Real ${p.avance_real || 0}% / Prog ${p.avance_programado || 0}% · desv ${desv(p).toFixed(1)}%${p.subcontratista ? ` · ${p.subcontratista}` : ''}`,
      severidad: sevPartida(p),
    })),
    ...inspecciones.map((i: any) => ({
      id: `nc:${i.id}`, tipo: 'NoConformidad',
      label: N(i.numero_correlativo || i.descripcion || 'Inspección').slice(0, 60),
      detalle: `${N(i.tipo)} · gravedad ${N(i.gravedad)} · ${N(i.estado)}${i.inspector ? ` · ${i.inspector}` : ''}`,
      severidad: i.gravedad === 'critica' ? 'critica' : ['cerrada', 'aprobada'].includes(i.estado) ? 'ok' : 'advertencia',
    })),
    ...rdis.map((r: any) => ({
      id: `rdi:${r.id}`, tipo: 'RDI', label: N(r.numero_rdi ? `${r.numero_rdi} · ${r.titulo}` : r.titulo).slice(0, 70),
      detalle: `${N(r.estado)} · prioridad ${N(r.prioridad)}${r.fecha_vencimiento ? ` · vence ${r.fecha_vencimiento}` : ''}`,
      severidad: ['vencido'].includes(r.estado) || r.prioridad === 'critica' ? 'critica' : ['cerrado', 'respondido'].includes(r.estado) ? 'ok' : 'advertencia',
    })),
    ...edps.map((e: any) => ({
      id: `edp:${e.id}`, tipo: 'EDP', label: N(e.numero_edp || 'EDP'),
      detalle: `$${Number(e.monto_usd || 0).toLocaleString()} USD · ${N(e.estado)}${e.subcontratista ? ` · ${e.subcontratista}` : ''}`,
      severidad: ['bloqueado_calidad', 'rechazado'].includes(e.estado) ? 'critica' : ['aprobado', 'pagado'].includes(e.estado) ? 'ok' : 'advertencia',
    })),
    ...alertas.map((a: any) => ({
      id: `alerta:${a.id}`, tipo: 'Alerta', label: N(a.titulo).slice(0, 70),
      detalle: `${N(a.tipo)} · nivel ${N(a.nivel)} · ${N(a.estado)}${a.escalada ? ' · escalada' : ''}`,
      severidad: a.nivel === 'critica' ? 'critica' : a.estado === 'resuelta' ? 'ok' : 'advertencia',
    })),
    ...docs.map((d: any) => ({
      id: `doc:${d.id}`, tipo: 'Documento', label: N(d.titulo).slice(0, 70),
      detalle: `${N(d.tipo)} · ${N(d.especialidad)} · ${N(d.estado_indexacion)}`,
      severidad: d.estado_indexacion === 'indexado' ? 'ok' : 'advertencia',
    })),
  ];

  // Un solo MERGE masivo por nodos: barato y idempotente.
  await grafo(
    `UNWIND $nodos AS n
     CALL apoc.noop() // placeholder
     RETURN 0`,
    {}
  ).catch(() => null); // apoc puede no existir: se ignora, el merge real va abajo

  await grafo(
    `UNWIND $nodos AS n
     MERGE (x:Nodo {id: n.id})
     SET x.tipo = n.tipo, x.label = n.label, x.detalle = n.detalle,
         x.severidad = n.severidad, x.proyecto = $proyecto`,
    { nodos, proyecto: proyecto_id }
  );

  const aristas: any[] = [];
  const push = (a: string, rel: string, b: string) => { if (a && b) aristas.push({ a, rel, b }); };

  for (const p of partidas) push(`obra:${obra.id}`, 'CONTIENE', `partida:${p.id}`);
  for (const i of inspecciones) push(`nc:${i.id}`, 'AFECTA', `partida:${i.partida_id}` in {} ? '' : `partida:${i.partida_id}`);
  for (const r of rdis) if (r.partida_id) push(`rdi:${r.id}`, 'CONSULTA', `partida:${r.partida_id}`);
  for (const e of edps) if (e.partida_id) push(`edp:${e.id}`, 'PAGA', `partida:${e.partida_id}`);
  for (const a of alertas) if (a.partida_id) push(`alerta:${a.id}`, 'ALERTA_DE', `partida:${a.partida_id}`);
  for (const a of alertas) if (!a.partida_id) push(`alerta:${a.id}`, 'ALERTA_DE', `obra:${obra.id}`);
  for (const d of docs) push(`doc:${d.id}`, 'DOCUMENTA', `obra:${obra.id}`);
  // Cadena de negocio "No Quality, No Pay": la NC crítica bloquea el EDP de su partida.
  for (const i of inspecciones.filter((x: any) => x.gravedad === 'critica' && !['cerrada', 'aprobada'].includes(x.estado))) {
    for (const e of edps.filter((x: any) => x.partida_id === i.partida_id)) push(`nc:${i.id}`, 'BLOQUEA', `edp:${e.id}`);
  }
  // Un RDI abierto sobre la misma partida retiene el frente.
  for (const r of rdis.filter((x: any) => ['abierto', 'en_revision', 'vencido'].includes(x.estado))) {
    for (const a of alertas.filter((x: any) => x.partida_id && x.partida_id === r.partida_id)) push(`rdi:${r.id}`, 'ORIGINA', `alerta:${a.id}`);
  }

  await grafo(
    `UNWIND $aristas AS e
     MATCH (a:Nodo {id: e.a}), (b:Nodo {id: e.b})
     CALL (a, b, e) {
       WITH a, b, e
       MERGE (a)-[r:REL {tipo: e.rel}]->(b)
       RETURN r
     }
     RETURN count(*) AS creadas`,
    { aristas }
  );

  return { nodos: nodos.length, aristas: aristas.length };
}

const RETORNO = `RETURN DISTINCT
  a.id AS a_id, a.tipo AS a_tipo, a.label AS a_label, a.detalle AS a_detalle, a.severidad AS a_sev,
  r.tipo AS rel,
  b.id AS b_id, b.tipo AS b_tipo, b.label AS b_label, b.detalle AS b_detalle, b.severidad AS b_sev`;

// Consultas Cypher por intención. El grafo responde preguntas que ninguna
// tabla responde sola: propagación de impacto y caminos entre entidades.
export function cypherPorModo(modo: string) {
  switch (modo) {
    case 'riesgo':
      return `MATCH (a:Nodo {proyecto:$proyecto})-[r:REL]->(b:Nodo {proyecto:$proyecto})
              WHERE a.severidad = 'critica' OR b.severidad = 'critica'
              ${RETORNO} LIMIT 90`;
    case 'pagos':
      return `MATCH (a:Nodo {proyecto:$proyecto})-[r:REL]-(b:Nodo {proyecto:$proyecto})
              WHERE a.tipo IN ['EDP','NoConformidad','Partida'] AND b.tipo IN ['EDP','NoConformidad','Partida']
              ${RETORNO} LIMIT 90`;
    case 'calidad':
      return `MATCH (a:Nodo {proyecto:$proyecto})-[r:REL]-(b:Nodo {proyecto:$proyecto})
              WHERE a.tipo IN ['NoConformidad','Partida','Documento'] AND b.tipo IN ['NoConformidad','Partida','Documento']
              ${RETORNO} LIMIT 90`;
    case 'foco':
      return `MATCH (c:Nodo {proyecto:$proyecto})
              WHERE toLower(c.label) CONTAINS toLower($foco) OR c.id = $foco
              WITH c LIMIT 1
              MATCH p = (c)-[:REL*1..2]-(x:Nodo)
              UNWIND relationships(p) AS r
              WITH startNode(r) AS a, r, endNode(r) AS b
              ${RETORNO} LIMIT 90`;
    default:
      return `MATCH (a:Nodo {proyecto:$proyecto})-[r:REL]->(b:Nodo {proyecto:$proyecto})
              ${RETORNO} LIMIT 120`;
  }
}

export function normalizar(filas: any[]) {
  const nodos = new Map<string, any>();
  const aristas: any[] = [];
  const add = (id: string, tipo: string, label: string, detalle: string, severidad: string) => {
    if (!id || nodos.has(id)) return;
    nodos.set(id, { id, tipo: tipo || 'Nodo', label: label || id, detalle: detalle || '', severidad: severidad || 'ok' });
  };
  for (const f of filas) {
    add(f.a_id, f.a_tipo, f.a_label, f.a_detalle, f.a_sev);
    add(f.b_id, f.b_tipo, f.b_label, f.b_detalle, f.b_sev);
    if (f.a_id && f.b_id) aristas.push({ origen: f.a_id, destino: f.b_id, rel: f.rel || 'REL' });
  }
  return { nodos: [...nodos.values()], aristas };
}