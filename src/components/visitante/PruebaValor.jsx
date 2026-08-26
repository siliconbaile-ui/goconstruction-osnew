import { FileSearch, ShieldCheck, MessageSquare, Gauge } from 'lucide-react';

const PUNTOS = [
  { icon: FileSearch, titulo: 'Cita la página exacta', texto: 'Responde con el documento y la página de tus EETT, planos o normativa chilena.' },
  { icon: ShieldCheck, titulo: 'Bloquea el pago con NC crítica', texto: 'Si hay una no conformidad abierta, el estado de pago no avanza.' },
  { icon: MessageSquare, titulo: 'Terreno por WhatsApp', texto: 'El capataz manda la foto y queda registrada y georreferenciada al instante.' },
  { icon: Gauge, titulo: 'Desviación detectada sola', texto: 'Programado versus real vigilado 24/7, con escalamiento automático.' },
];

// Bloque de valor para el visitante: qué gana una constructora chilena, en concreto.
export default function PruebaValor() {
  return (
    <section className="grid sm:grid-cols-2 gap-2.5">
      {PUNTOS.map(({ icon: Icon, titulo, texto }) => (
        <div key={titulo} className="p-4 rounded-2xl bg-surface border border-hairline">
          <Icon className="w-4 h-4 text-primary mb-2" />
          <h3 className="text-sm font-semibold text-foreground mb-1">{titulo}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{texto}</p>
        </div>
      ))}
    </section>
  );
}