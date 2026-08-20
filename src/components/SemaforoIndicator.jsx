import { colorSemaforo } from '@/lib/orionUtils';

export default function SemaforoIndicator({ color = 'gris', label, size = 'md' }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-5 h-5',
  };
  const c = colorSemaforo(color);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} rounded-full flex-shrink-0`}
        style={{ background: c, boxShadow: `0 0 0 3px ${c}22` }}
      />
      {label && <span className="text-sm text-foreground">{label}</span>}
    </div>
  );
}