import { colorSemaforo } from '@/lib/orionUtils';

export default function SemaforoIndicator({ color = 'gris', label, size = 'md' }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} rounded-full flex-shrink-0`}
        style={{
          background: colorSemaforo(color),
          boxShadow: `0 0 8px ${colorSemaforo(color)}60`,
        }}
      />
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  );
}