import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { mostrarNotificacion } from '@/lib/pwa';

const KEY = 'orion_notificaciones';

// Notificaciones al celular cuando entra una alerta nueva de obra.
export default function NotificacionesMovil() {
  const [activas, setActivas] = useState(() => localStorage.getItem(KEY) === '1');

  const alternar = async () => {
    if (activas) {
      localStorage.setItem(KEY, '0');
      setActivas(false);
      return;
    }
    if (!('Notification' in window)) return;
    const permiso = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();
    if (permiso !== 'granted') return;
    localStorage.setItem(KEY, '1');
    setActivas(true);
    mostrarNotificacion({
      titulo: 'GO vigilando tu obra',
      cuerpo: 'Te avisaré al celular cuando entre una alerta nueva.',
      tag: 'go-bienvenida',
    });
  };

  useEffect(() => {
    if (!activas) return;
    const inicio = Date.now();
    return base44.entities.AlertaSistema.subscribe((event) => {
      if (event.type !== 'create') return;
      const a = event.data;
      if (new Date(a.created_date || Date.now()).getTime() < inicio - 5000) return;
      mostrarNotificacion({
        titulo: a.nivel === 'critica' ? `🔴 ${a.titulo}` : a.titulo,
        cuerpo: a.mensaje || 'Nueva alerta en la obra',
        url: '/centro-alertas',
        tag: `alerta-${a.id}`,
      });
    });
  }, [activas]);

  const soportado = typeof window !== 'undefined' && 'Notification' in window;
  if (!soportado) return null;

  const bloqueado = Notification.permission === 'denied';

  return (
    <button onClick={alternar} disabled={bloqueado}
      title={bloqueado ? 'Notificaciones bloqueadas en el navegador' : activas ? 'Notificaciones al celular activas' : 'Activar notificaciones al celular'}
      className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:px-3 rounded-full disabled:opacity-40 bg-surface-raised border border-hairline"
      style={activas ? { color: 'hsl(var(--ok))' } : { color: 'hsl(var(--muted-foreground))' }}>
      {bloqueado ? <BellOff className="w-4 h-4" /> : activas ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      <span className="hidden sm:inline font-mono text-[10px]">{activas ? 'AVISOS ON' : 'AVISOS'}</span>
    </button>
  );
}