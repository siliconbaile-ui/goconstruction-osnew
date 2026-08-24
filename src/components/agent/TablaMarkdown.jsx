import ReactMarkdown from 'react-markdown';

// Celda con markdown en línea (negritas, código) sin envolver en <p>.
function Celda({ children }) {
  return <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>{children}</ReactMarkdown>;
}

// Terreno: en celular una tabla de 4 columnas es ilegible y obliga a scroll
// horizontal. Bajo sm cada fila se muestra como tarjeta "columna: valor".
export default function TablaMarkdown({ head, rows }) {
  return (
    <div className="my-2">
      {/* Móvil: tarjetas */}
      <div className="sm:hidden space-y-2">
        {rows.map((fila, i) => (
          <div key={i} className="rounded-xl border border-hairline bg-surface-raised px-3 py-2">
            <div className="text-sm font-semibold text-foreground break-words">
              <Celda>{fila[0] || ''}</Celda>
            </div>
            <dl className="mt-1.5 space-y-1">
              {head.slice(1).map((col, j) => (
                <div key={j} className="flex gap-2 text-xs">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground pt-0.5 flex-shrink-0 max-w-[38%] break-words">{col}</dt>
                  <dd className="text-foreground/90 min-w-0 break-words flex-1">
                    <Celda>{fila[j + 1] || '—'}</Celda>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Tablet y desktop: tabla real */}
      <div className="hidden sm:block -mx-1 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {head.map((c, i) => (
                <th key={i} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((fila, i) => (
              <tr key={i}>
                {fila.map((c, j) => (
                  <td key={j} className="px-2 py-1.5 border-t border-hairline align-top text-foreground/90 break-words">
                    <Celda>{c}</Celda>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}