import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { kapsoRequest, kapsoWindow } from '../../shared/kapso.ts';

const GO_SANDBOX_PHONE_ID = '597907523413541';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Inicia sesión.' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Solo administradores pueden gestionar el WhatsApp de Kapso.' }, { status: 403 });
    const input = await req.json();
    const { action, phone_id: phoneId, conversation_id: conversationId } = input;
    if (action === 'numbers') {
      const page = Math.max(1, Math.min(10000, Math.floor(Number(input.page) || 1)));
      const result = await kapsoRequest(`/whatsapp/phone_numbers?per_page=20&page=${page}`, { platform: true });
      const sandbox = result.data.filter(n => n.phone_number_id === GO_SANDBOX_PHONE_ID);
      return Response.json({ data: sandbox.map(n => ({ id: n.phone_number_id, name: n.name, number: n.display_phone_number || '', status: n.status || 'Sin estado informado' })), meta: { ...result.meta, total_pages: 1, total_count: sandbox.length } });
    }
    if (!['conversations', 'messages', 'send'].includes(action)) return Response.json({ error: 'Operación no válida.' }, { status: 400 });
    if (typeof phoneId !== 'string' || !/^\d{1,30}$/.test(phoneId)) return Response.json({ error: 'Selecciona un número de Kapso.' }, { status: 400 });
    if (phoneId !== GO_SANDBOX_PHONE_ID) return Response.json({ error: 'GO está configurado exclusivamente para Sandbox WhatsApp.' }, { status: 403 });
    const numbers = await kapsoRequest(`/whatsapp/phone_numbers?phone_number_id=${phoneId}`, { platform: true });
    if (!numbers.data?.some(n => n.phone_number_id === phoneId)) return Response.json({ error: 'Número no disponible en esta cuenta.' }, { status: 403 });
    if (input.after && (typeof input.after !== 'string' || input.after.length > 4096)) return Response.json({ error: 'Página no válida.' }, { status: 400 });
    const query = new URLSearchParams({ limit: '30', fields: 'kapso(default)' });
    if (input.after) query.set('after', input.after);
    if (action === 'conversations') {
      const result = await kapsoRequest(`/${phoneId}/conversations?${query}`);
      return Response.json({ data: result.data || [], after: result.paging?.cursors?.after || null });
    }
    if (typeof conversationId !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(conversationId)) return Response.json({ error: 'Selecciona una conversación.' }, { status: 400 });
    const conversation = await kapsoRequest(`/${phoneId}/conversations/${encodeURIComponent(conversationId)}?fields=kapso(default)`);
    if (String(conversation.phone_number_id) !== phoneId) return Response.json({ error: 'La conversación no pertenece al número seleccionado.' }, { status: 403 });
    if (action === 'messages') {
      query.set('conversation_id', conversationId);
      const result = await kapsoRequest(`/${phoneId}/messages?${query}`);
      return Response.json({ data: result.data || [], after: result.paging?.cursors?.after || null, can_send: kapsoWindow(conversation), conversation });
    }
    if (!['text', 'location'].includes(input.kind)) return Response.json({ error: 'Tipo de mensaje no válido.' }, { status: 400 });
    if (!kapsoWindow(conversation)) return Response.json({ error: 'La ventana de atención de 24 horas está cerrada o no pudo verificarse. Se necesita una plantilla aprobada o un nuevo mensaje del contacto.' }, { status: 409 });
    const phone = String(conversation.phone_number || '').replace(/^\+/, '');
    const bsuid = conversation.business_scoped_user_id || conversation.parent_business_scoped_user_id;
    const recipient = /^\d{7,15}$/.test(phone) ? { to: phone } : bsuid ? { recipient: bsuid } : null;
    if (!recipient) return Response.json({ error: 'No hay destinatario válido en esta conversación.' }, { status: 400 });
    const text = typeof input.text === 'string' ? input.text.trim() : '';
    if (input.kind === 'text' && (!text || text.length > 4096)) return Response.json({ error: 'Escribe entre 1 y 4096 caracteres.' }, { status: 400 });
    const content = input.kind === 'text' ? { type: 'text', text: { body: text } } : {
      type: 'interactive', interactive: { type: 'location_request_message', body: { text: 'Comparte voluntariamente tu ubicación actual para el registro de terreno. Indica a qué foto, obra y sector corresponde. Esta ubicación no certifica dónde se tomó la foto.' }, action: { name: 'send_location' } },
    };
    const sent = await kapsoRequest(`/${phoneId}/messages`, { body: { messaging_product: 'whatsapp', recipient_type: 'individual', ...recipient, ...content } });
    return Response.json({ accepted: true, message_id: sent.messages?.[0]?.id || null });
  } catch (error) {
    return Response.json({ error: error.message || 'No se pudo conectar con Kapso.' }, { status: 500 });
  }
}