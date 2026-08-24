import ReactMarkdown from 'react-markdown';
import TablaMarkdown from './TablaMarkdown';

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
  return <TablaMarkdown head={celdas(head)} rows={rows.map(celdas)} />;
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
    <div className="text-sm leading-relaxed text-foreground min-w-0 break-words [&_pre]:overflow-x-auto [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-semibold [&_code]:px-1 [&_code]:rounded [&_code]:bg-surface-raised [&_code]:text-[12px]">
      {bloques.map((b, i) => b.tipo === 'tabla'
        ? <Tabla key={i} filas={b.lineas} />
        : <ReactMarkdown key={i}>{b.lineas.join('\n')}</ReactMarkdown>
      )}
    </div>
  );
}