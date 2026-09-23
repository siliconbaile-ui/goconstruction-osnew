import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

const rutas = new Set(['/onboarding', '/demo', '/app', '/login', '/register']);

export default function IncorporacionResponse({ content }) {
  const secciones = content.split(/(?=^(?:#{2,3}\s+|\d+\.\s+[A-ZÁÉÍÓÚ]|Lo que (?:puedo|no puedo) hacer desde acá))/m).filter(s => s.trim());
  return (
    <div className="go-message-content min-w-0 space-y-2.5 text-sm leading-relaxed text-foreground">
      {secciones.map((seccion, i) => (
        <section key={i} className="rounded-xl border border-hairline bg-surface p-4 sm:p-5">
          <ReactMarkdown components={{
            h2: ({ children }) => <h2 className="mb-2 font-heading text-base font-semibold text-foreground">{children}</h2>,
            h3: ({ children }) => <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">{children}</h3>,
            p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0 text-foreground/90">{children}</p>,
            ul: ({ children }) => <ul className="my-2 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="my-2 list-decimal space-y-2 pl-5">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            a: ({ href, children }) => href?.startsWith('/') && rutas.has(href.split('?')[0])
              ? <Link to={href} className="font-semibold text-primary underline underline-offset-4">{children}</Link>
              : <span>{children}</span>,
          }}>{seccion}</ReactMarkdown>
        </section>
      ))}
    </div>
  );
}