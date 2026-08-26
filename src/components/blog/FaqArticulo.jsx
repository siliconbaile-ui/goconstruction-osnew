// Preguntas frecuentes del artículo. Se espejan en JSON-LD (FAQPage) para
// competir por los resultados enriquecidos de la consulta objetivo.
export default function FaqArticulo({ faq }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Preguntas frecuentes</h2>
      <div className="space-y-2.5">
        {faq.map(f => (
          <div key={f.p} className="p-4 rounded-xl bg-surface-raised border border-hairline">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{f.p}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.r}</p>
          </div>
        ))}
      </div>
    </section>
  );
}