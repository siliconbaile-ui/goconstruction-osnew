// Registro del service worker de Orion.
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Muestra una notificación local en el celular (requiere permiso otorgado).
export async function mostrarNotificacion({ titulo, cuerpo, url = '/', tag }) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker?.getRegistration();
  const opciones = {
    body: cuerpo,
    tag,
    badge: '/manifest.json',
    data: { url },
    vibrate: [120, 60, 120],
  };
  if (reg?.showNotification) reg.showNotification(titulo, opciones);
  else new Notification(titulo, opciones);
}