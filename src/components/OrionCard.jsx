export default function OrionCard({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl orion-elevated ${className}`}
      style={{
        background: 'hsl(var(--surface-1))',
        border: '1px solid hsl(var(--hairline))',
        ...style,
      }}
    >
      {children}
    </div>
  );
}