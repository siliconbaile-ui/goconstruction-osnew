import { Moon, Sun } from 'lucide-react';
import useTheme from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const oscuro = theme === 'dark';

  return (
    <button
      onClick={toggle}
      title={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Cambiar tema"
      className="relative flex items-center gap-1.5 h-9 px-2 rounded-full transition-colors"
      style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--hairline))' }}
    >
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full transition-colors"
        style={oscuro
          ? { background: 'hsl(var(--primary))', color: '#fff' }
          : { color: 'hsl(var(--muted-foreground))' }}
      >
        <Moon className="w-3.5 h-3.5" />
      </span>
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full transition-colors"
        style={!oscuro
          ? { background: 'hsl(var(--primary))', color: '#fff' }
          : { color: 'hsl(var(--muted-foreground))' }}
      >
        <Sun className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}