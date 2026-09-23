import { kapsoRequest } from "./kapso.ts";
import { construirSalidaKapso } from "./kapsoInteractivo.ts";

// ID de teléfono Meta de GO en Kapso (producción).
export const GO_PHONE_NUMBER_ID = "1318336508028669";
export const GO_DISPLAY_NUMBER = "+1 208-445-5689";

// Eventos relevantes del webhook de Kapso.
export const EVENTO_MENSAJE_RECIBIDO = "whatsapp.message.received";

// Estructura mínima de un mensaje entrante normalizado.
export interface MensajeEntrante {
  message_id: string;
  conversation_id: string;
  phone_number_id: string;
  remite_numero: string;
  remite_nombre: string;
  tipo_mensaje: "texto" | "foto" | "documento" | "audio" | "ubicacion" | "sistema";
  contenido_texto: string;
  archivo_url: string;
  archivo_mime: string;
  transcripcion: string;
  coordenadas_gps: string;
  timestamp_inbound: string;
  opcion_elegida?: { id: string; titulo: string; tipo: string };
}

// Verifica la firma HMAC-SHA256 del webhook de Kapso.
// Kapso firma el raw body exacto (bytes como llegaron), no un JSON re-serializado.
export async function verificarFirma(rawBody: string | ArrayBuffer, firmaHeader: string | null, secreto: string): Promise<boolean> {
  if (typeof firmaHeader !== "string" || !firmaHeader || !secreto) return false;
  const encoder = new TextEncoder();
  const key = encoder.encode(secreto);
  const msg = typeof rawBody === "string" ? encoder.encode(rawBody) : new Uint8Array(rawBody);
  // crypto.subtle.digest es async en Workers; usamos la API estándar.
  return crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then(cryptoKey => crypto.subtle.sign("HMAC", cryptoKey, msg))
    .then(buf => {
      const esperado = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      if (esperado.length !== firmaHeader.length) return false;
      // Comparación timing-safe manual sobre hex.
      let diff = 0;
      for (let i = 0; i < esperado.length; i++) diff |= esperado.charCodeAt(i) ^ firmaHeader.charCodeAt(i);
      return diff === 0;
    });
}

// Normaliza el payload de Kapso a MensajeEntrante.
// No inventa transcripción ni ubicación si no existe.
export function normalizarMensaje(payload: any, phoneId: string): MensajeEntrante | null {
  if (!payload || typeof payload !== "object") return null;
  const msg = payload.message || payload;
  const messageId = String(msg.id || msg.message_id || payload.message_id || "").trim();
  if (!messageId) return null;

  const conv = payload.conversation || {};
  const conversationId = String(conv.id || msg.conversation_id || payload.conversation_id || "").trim();

  const from = msg.from || conv.phone_number || msg.phone_number || payload.phone_number || "";
  const remiteNumero = String(from).replace(/[^\d]/g, "");
  const remiteNombre = String(conv.contact_name || msg.contact_name || msg.name || "").trim();

  const tipoRaw = String(msg.type || "text").toLowerCase();
  let tipo: MensajeEntrante["tipo_mensaje"] = "texto";
  if (tipoRaw === "image" || tipoRaw === "photo") tipo = "foto";
  else if (tipoRaw === "document" || tipoRaw === "file") tipo = "documento";
  else if (tipoRaw === "audio" || tipoRaw === "voice") tipo = "audio";
  else if (tipoRaw === "location") tipo = "ubicacion";
  else if (tipoRaw === "system" || tipoRaw === "unknown") tipo = "sistema";

  let contenidoTexto = "";
  let archivoUrl = "";
  let archivoMime = "";
  let transcripcion = "";
  let coordenadas = "";

  if (msg.text?.body) contenidoTexto = String(msg.text.body);
  else if (msg.body) contenidoTexto = String(msg.body);
  else if (msg.caption) contenidoTexto = String(msg.caption);

  if (msg.image?.url) { archivoUrl = String(msg.image.url); archivoMime = String(msg.image.mime_type || "image/jpeg"); }
  else if (msg.document?.url) { archivoUrl = String(msg.document.url); archivoMime = String(msg.document.mime_type || "application/octet-stream"); }
  else if (msg.audio?.url) { archivoUrl = String(msg.audio.url); archivoMime = String(msg.audio.mime_type || "audio/ogg"); }
  else if (msg.voice?.url) { archivoUrl = String(msg.voice.url); archivoMime = String(msg.voice.mime_type || "audio/ogg"); }

  if (!contenidoTexto && msg.kapso?.content) contenidoTexto = String(msg.kapso.content);
  if (msg.kapso?.media_url) archivoUrl = String(msg.kapso.media_url);
  if (msg.kapso?.media_data?.mime_type) archivoMime = String(msg.kapso.media_data.mime_type);
  if (msg.kapso?.transcript) transcripcion = String(msg.kapso.transcript);
  else if (msg.transcription?.text) transcripcion = String(msg.transcription.text);
  if (msg.location?.latitude != null && msg.location?.longitude != null) {
    coordenadas = `${msg.location.latitude},${msg.location.longitude}`;
  }

  // WhatsApp mantiene el mismo remitente y conversación para botones y listas.
  const reply = msg.interactive?.button_reply || msg.interactive?.list_reply;
  const opcionElegida = reply?.id ? {
    id: String(reply.id), titulo: String(reply.title || ''),
    tipo: msg.interactive.button_reply ? 'button_reply' : 'list_reply',
  } : undefined;
  if (opcionElegida) {
    tipo = 'texto';
    contenidoTexto = `Opción elegida: ${opcionElegida.titulo} [${opcionElegida.id}]`;
  }

  const ts = msg.timestamp ?? payload.timestamp ?? conv.kapso?.last_inbound_at ?? conv.last_inbound_at ?? new Date().toISOString();
  // Kapso v2: message.timestamp es Unix en segundos, incluso cuando llega como string.
  const fecha = new Date(typeof ts === "number" || /^\d+$/.test(String(ts)) ? Number(ts) * 1000 : ts);
  if (!Number.isFinite(fecha.getTime())) return null;

  return {
    message_id: messageId,
    conversation_id: conversationId,
    phone_number_id: phoneId,
    remite_numero: remiteNumero,
    remite_nombre: remiteNombre,
    tipo_mensaje: tipo,
    contenido_texto: contenidoTexto,
    archivo_url: archivoUrl,
    archivo_mime: archivoMime,
    transcripcion,
    coordenadas_gps: coordenadas,
    timestamp_inbound: fecha.toISOString(),
    ...(opcionElegida ? { opcion_elegida: opcionElegida } : {}),
  };
}

// Envía texto, reply buttons (1–3 opciones) o list message (4–10) al mismo chat.
// En modo test (enviarReal=false) no realiza la llamada HTTP: devuelve el payload capturado.
export async function enviarRespuestaKapso(
  phoneId: string,
  mensaje: MensajeEntrante,
  texto: string,
  enviarReal: boolean,
  opciones = []
): Promise<{ ok: boolean; message_id?: string; test_payload?: any; error?: string }> {
  const phone = mensaje.remite_numero.replace(/^\+/, "");
  if (!/^\d{7,15}$/.test(phone)) return { ok: false, error: "Remitente sin número válido." };
  const body = construirSalidaKapso(phone, texto, opciones);
  if (!enviarReal) return { ok: true, test_payload: { phone_id: phoneId, body, simulated: true } };
  try {
    const sent = await kapsoRequest(`/${phoneId}/messages`, { body });
    return { ok: true, message_id: sent.messages?.[0]?.id || null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Health check del puente: valida que el secreto y la API key existan.
export function estadoPuente(secretoWebhook: string | undefined, apiKey: string | undefined) {
  return {
    webhook_secret_configurado: Boolean(secretoWebhook),
    api_key_configurada: Boolean(apiKey),
    phone_number_id: GO_PHONE_NUMBER_ID,
    modo_test: false,
    timestamp: new Date().toISOString(),
  };
}