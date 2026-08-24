const MARCA_URL = 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/08dbc115f_generated_image.png';

// Marca oficial GoConstruction OS: isotipo GO + wordmark.
// tamaño: 'sm' (headers móviles) | 'md' (sidebar).
export default function Logo({ tamano = 'md', conBajada = true, className = '' }) {
  const sm = tamano === 'sm';
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <img
        src={MARCA_URL}
        alt="GoConstruction OS"
        className={`${sm ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'} flex-shrink-0 object-cover ring-1 ring-hairline`}
      />
      <div className="min-w-0">
        <div className={`font-bold tracking-wide leading-tight truncate text-foreground ${sm ? 'text-sm' : 'text-sm'}`}>
          GoConstruction <span className="text-primary">OS</span>
        </div>
        {conBajada && (
          <div className="font-mono text-[10px] leading-tight truncate text-muted-foreground">
            COMMAND CENTER · OBRA
          </div>
        )}
      </div>
    </div>
  );
}