export default function MicrosoftMark({ className = '' }) {
  return <span aria-hidden="true" className={`grid grid-cols-2 gap-0.5 ${className}`}>
    <span className="bg-info" /><span className="bg-ok" />
    <span className="bg-warn" /><span className="bg-primary" />
  </span>;
}