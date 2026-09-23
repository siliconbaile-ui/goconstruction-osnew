import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { emitirCodigoGo, revocarVinculoGo, vinculoDelUsuario } from '../../shared/goVinculacion.ts';

function cuerpoRespuesta(texto) {
  try { const obj = JSON.parse(texto); return typeof obj.cuerpo === 'string' ? obj.cuerpo : texto; }
  catch { return texto || ''; }
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Inicia sesión.' }, { status: 401 });
    const { accion = 'estado', cursor } = await req.json();
    if (accion === 'emitir') return Response.json(await emitirCodigoGo(base44, user.id, user.full_name || user.nombre_contacto));
    if (accion === 'revocar') {
      await revocarVinculoGo(base44, user.id);
      return Response.json({ vinculado: false });
    }
    const vinculo = await vinculoDelUsuario(base44, user.id);
    if (accion === 'estado') return Response.json({ vinculado: Boolean(vinculo), telefono: vinculo ? `••••${vinculo.telefono.slice(-4)}` : null });
    if (!['historial', 'reciente'].includes(accion)) return Response.json({ error: 'Acción inválida.' }, { status: 400 });
    if (!vinculo) return Response.json({ vinculado: false, turnos: [], siguiente: null });
    if (cursor && (typeof cursor !== 'string' || !Number.isFinite(Date.parse(cursor))))
      return Response.json({ error: 'Cursor inválido.' }, { status: 400 });
    const query = { phone_number_id: vinculo.phone_number_id, remite_numero: vinculo.telefono,
      ...(cursor && accion === 'historial' ? { created_date: { $lt: cursor } } : {}) };
    const limite = accion === 'reciente' ? 8 : 30;
    const registros = await base44.asServiceRole.entities.WebhookKapso.filter(query, '-created_date', limite);
    const turnos = registros.map(r => ({ id: r.id, fecha: r.timestamp_inbound || r.created_date,
      entrada: r.contenido_texto || r.transcripcion || (r.tipo_mensaje === 'foto' ? '[Foto]' : r.tipo_mensaje === 'audio' ? '[Audio]' : `[${r.tipo_mensaje}]`),
      salida: cuerpoRespuesta(r.respuesta_texto), estado: r.estado })).filter(r => r.estado !== 'duplicado');
    return Response.json({ vinculado: true, turnos, siguiente: accion === 'historial' && registros.length === limite ? registros.at(-1).created_date : null });
  } catch (error) {
    console.error('memoriaGo:', error);
    return Response.json({ error: 'No se pudo consultar la memoria de GO.' }, { status: 500 });
  }
}