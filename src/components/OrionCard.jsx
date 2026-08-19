export default function OrionCard({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: '#0D1526',
        border: '1px solid #1E2D4A',
        ...style,
      }}
    >
      {children}
    </div>
  );
}