import ReactMarkdown from 'react-markdown';

// Orion suele escribir tablas markdown en una sola línea ("| a | b | |---|---| | 1 | 2 |").
// Sin esto se veían como texto plano con pipes. Aquí se reconstruyen las filas
// y se renderizan como tabla real; el resto del texto sigue pasando por markdown.
function normalizar(texto) {
  return texto.replace(/\|\s*\|/g, '|\n|');
}

function esSeparador(fila) {
  return /^[\s|:-]+$/.test(fila);
}

function celdas(fila) {
  return fila.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
}

function Tabla({ filas }) {
  const cuerpo = filas.filter(f => !esSeparador(f));
  if (cuerpo.length === 0) return null;
  const [head, ...rows] = cuerpo;

  return (
    <div className="my-2 -mx-1 overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {celdas(head).map((c, i) => (
              <th key={i} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((fila, i) => (
            <tr key={i}>
              {celdas(fila).map((c, j) => (
                <td key={j} className="px-2 py-1.5 border-t border-hairline align-top text-foreground/90">
                  <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>{c}</ReactMarkdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownContent({ content }) {
  const lineas = normalizar(content).split('\n');
  const bloques = [];

  for (const linea of lineas) {
    const esFila = linea.trim().startsWith('|');
    const ultimo = bloques[bloques.length - 1];
    if (esFila && ultimo?.tipo === 'tabla') ultimo.lineas.push(linea.trim());
    else if (esFila) bloques.push({ tipo: 'tabla', lineas: [linea.trim()] });
    else if (ultimo?.tipo === 'texto') ultimo.lineas.push(linea);
    else bloques.push({ tipo: 'texto', lineas: [linea] });
  }

  return (
    <div className="text-sm leading-relaxed text-foreground [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-semibold [&_code]:px-1 [&_code]:rounded [&_code]:bg-surface-raised [&_code]:text-[12px]">
      {bloques.map((b, i) => b.tipo === 'tabla'
        ? <Tabla key={i} filas={b.lineas} />
        : <ReactMarkdown key={i}>{b.lineas.join('\n')}</ReactMarkdown>
      )}
    </div>
  );
}