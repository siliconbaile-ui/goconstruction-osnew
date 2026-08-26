const LOGO = 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/08dbc115f_generated_image.png';

// Registro del service worker de GoConstruction OS.
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Muestra una notificación local en el celular (requiere permiso otorgado).
export async function mostrarNotificacion({ titulo, cuerpo, url = '/app', tag }) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker?.getRegistration();
  const opciones = {
    body: cuerpo,
    tag,
    icon: LOGO,
    badge: LOGO,
    data: { url },
    vibrate: [120, 60, 120],
  };
  if (reg?.showNotification) reg.showNotification(titulo, opciones);
  else new Notification(titulo, opciones);
}