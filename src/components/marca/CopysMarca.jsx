import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const URL_APP = 'https://whatsapptobim.base44.app';

const COPYS = [
  {
    id: 'relato',
    titulo: 'Relato de marca · el pitch',
    uso: 'Presentaciones, prensa, página "quiénes somos"',
    texto: `GoConstruction OS es el command center de la obra. En el centro está GO: un jefe técnico digital con criterio de arquitecto chileno, que opera avance, calidad, RDIs, alertas y estados de pago conversando — desde la plataforma o por WhatsApp. Cada respuesta cita la página exacta de tus EETT y planos; cada acción queda registrada. No es un dashboard con chat: es una obra que se opera conversando.`,
  },
  {
    id: 'bio',
    titulo: 'Bio corta · redes sociales',
    uso: 'Instagram, LinkedIn, X (hasta 160 caracteres)',
    texto: `GO, el jefe técnico digital de tu obra 🏗️ Avance, calidad, RDIs y pagos operados por chat y WhatsApp, citando la página exacta de tus EETT. ${URL_APP}`,
  },
  {
    id: 'whatsapp',
    titulo: 'Mensaje para compartir · WhatsApp',
    uso: 'Reenviar a administradores de obra y gerencia',
    texto: `Mira esto: *GoConstruction OS*, un jefe técnico digital para la obra. Le mandas una foto o un plano por WhatsApp y queda registrado e indexado al tiro. Después le preguntas cualquier cosa técnica y te responde citando la página exacta de las EETT. Pruébalo acá: ${URL_APP}/demo`,
  },
  {
    id: 'descripcion',
    titulo: 'Descripción larga · marketplaces y fichas',
    uso: 'Directorios de software, propuestas comerciales',
    texto: `GoConstruction OS integra en una sola conversación lo que hoy vive repartido en planillas, correos y carpetas: control de avance con curva S, inspecciones de calidad y no conformidades, RDIs con detección de redundancia, estados de pago con bloqueo automático por calidad ("No Quality, No Pay") y alertas con escalamiento jerárquico. GO — el agente que dirige la oficina técnica digital — responde citando documento y página, dibuja el grafo relacional de la obra y ejecuta acciones de gestión por chat, voz o WhatsApp. Construido para terreno: teléfono, guantes y pleno sol.`,
  },
];

function BloqueCopy({ c }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    await navigator.clipboard.writeText(c.texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-surface border border-hairline">
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{c.titulo}</div>
          <div className="text-[10px] font-mono tracking-wider text-muted-foreground mt-0.5">{c.uso.toUpperCase()}</div>
        </div>
        <button onClick={copiar}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-semibold flex-shrink-0 bg-surface-raised border border-hairline text-primary">
          {copiado ? <Check className="w-3 h-3" style={{ color: 'hsl(var(--ok))' }} /> : <Copy className="w-3 h-3" />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">{c.texto}</p>
    </div>
  );
}

// Copys oficiales listos para pegar: relato, bio, WhatsApp y ficha comercial.
export default function CopysMarca() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {COPYS.map(c => <BloqueCopy key={c.id} c={c} />)}
    </div>
  );
}