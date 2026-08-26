// Tabla compacta read-only para el modo demo.
export default function TablaDemo({ titulo, columnas, filas, vacio = 'Sin registros' }) {
  return (
    <section className="orion-panel overflow-hidden">
      <header className="px-4 py-2.5 border-b border-hairline">
        <span className="text-[11px] font-mono tracking-widest text-muted-foreground">{titulo}</span>
      </header>
      {filas.length === 0 ? (
        <p className="px-4 py-4 text-xs text-muted-foreground">{vacio}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-hairline">
                {columnas.map(c => (
                  <th key={c} className="text-left font-mono text-[10px] tracking-wider px-4 py-2 text-muted-foreground whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-b border-hairline/60 last:border-0">
                  {f.map((celda, j) => (
                    <td key={j} className="px-4 py-2.5 text-foreground/85 whitespace-nowrap">{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}