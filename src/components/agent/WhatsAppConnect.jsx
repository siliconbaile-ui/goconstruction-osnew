import { base44 } from '@/api/base44Client';
import { MessageCircle } from 'lucide-react';

const url = () => base44.agents.getWhatsAppConnectURL('orion_asistente');

// El enlace se genera AL HACER CLIC (token fresco) y se abre en pestaña nueva;
// si el navegador bloquea la ventana, navegamos directo.
const abrirWhatsApp = (e) => {
  e.preventDefault();
  const destino = url();
  const win = window.open(destino, '_blank', 'noopener');
  if (!win) window.location.href = destino;
};

export function WhatsAppButton() {
  return (
    <a href="#whatsapp" onClick={abrirWhatsApp}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold tracking-wide flex-shrink-0"
      style={{ background: '#E7F7EC', color: '#1E8449' }}>
      <MessageCircle className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">WHATSAPP</span>
    </a>
  );
}

export default function WhatsAppConnect() {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E9E6E1' }}>
      <div className="text-[10px] font-mono tracking-widest mb-2" style={{ color: '#1E8449' }}>
        CANAL TERRENO · WHATSAPP
      </div>
      <p className="text-sm font-semibold leading-snug mb-2" style={{ color: '#141821' }}>
        El capataz no entra a la plataforma: le escribe a Orion.
      </p>
      <p className="text-xs leading-relaxed mb-3" style={{ color: '#6B7382' }}>
        Foto de terreno, consulta de EETT con página citada, avance de partida o RDI — todo por WhatsApp, con las mismas reglas y los mismos datos.
      </p>
      <ul className="space-y-1.5 mb-3">
        {[
          ['«alertas»', 'las alertas activas por criticidad'],
          ['«RDI …»', 'crea, consulta y responde requerimientos'],
          ['«pagos»', 'EDPs bloqueados y su motivo'],
        ].map(([cmd, desc]) => (
          <li key={cmd} className="flex gap-2 text-[11px]" style={{ color: '#6B7382' }}>
            <span className="font-mono flex-shrink-0" style={{ color: '#1E8449' }}>{cmd}</span>
            <span className="truncate">{desc}</span>
          </li>
        ))}
      </ul>
      <a href="#whatsapp" onClick={abrirWhatsApp}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: '#1E8449' }}>
        <MessageCircle className="w-4 h-4" />
        Conectar mi WhatsApp
      </a>
      <p className="text-[10px] leading-relaxed mt-2" style={{ color: '#A8B0BF' }}>
        Se abre el chat con tu cuenta ya vinculada. Cada usuario conecta su número una vez.
      </p>
    </div>
  );
}