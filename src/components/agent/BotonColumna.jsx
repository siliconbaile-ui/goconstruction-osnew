import { PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose } from 'lucide-react';

// Botón riel para extender/contraer las columnas laterales del chat.
export default function BotonColumna({ lado, abierta, onToggle }) {
  const Icon = lado === 'izquierda'
    ? (abierta ? PanelLeftClose : PanelLeftOpen)
    : (abierta ? PanelRightClose : PanelRightOpen);
  const etiqueta = lado === 'izquierda'
    ? (abierta ? 'Contraer atajos' : 'Extender atajos')
    : (abierta ? 'Contraer panel de obra' : 'Extender panel de obra');

  return (
    <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 w-9">
      <button onClick={onToggle} title={etiqueta} aria-label={etiqueta} aria-expanded={abierta}
        className="w-8 h-16 rounded-full flex items-center justify-center bg-surface border border-hairline text-muted-foreground transition-all hover:text-primary hover:border-primary/50 active:scale-95 orion-elevated">
        <Icon className="w-4 h-4" />
      </button>
    </div>
  );
}