import { secrets } from 'base44:runtime';

export async function kapsoRequest(path, { platform = false, body } = {}) {
  const key = secrets.get('KAPSO_API_KEY');
  if (!key) throw new Error('Falta configurar la clave de Kapso.');
  const root = platform ? 'https://api.kapso.ai/platform/v1' : 'https://api.kapso.ai/meta/whatsapp/v24.0';
  const response = await fetch(`${root}${path}`, {
    method: body ? 'POST' : 'GET', redirect: 'manual',
    headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status >= 300 && response.status < 400) throw new Error('Kapso devolvió una redirección no permitida.');
  const data = await response.json();
  if (!response.ok) {
    const detail = typeof data.error === 'string' ? data.error : data.error?.message;
    throw new Error(`Kapso (${response.status}): ${detail || 'No se pudo completar la solicitud.'}`);
  }
  return data;
}

export function kapsoWindow(conversation) {
  const time = new Date(conversation.kapso?.last_inbound_at || '').getTime();
  const age = Date.now() - time;
  return Number.isFinite(time) && age >= 0 && age < 24 * 60 * 60 * 1000;
}