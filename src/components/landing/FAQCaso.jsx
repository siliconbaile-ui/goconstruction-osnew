export default function FAQCaso({ caso }) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-lg font-semibold text-foreground">Preguntas frecuentes</h2>
      {caso.faq.map(f => (
        <details key={f.p} className="p-4 rounded-2xl bg-surface border border-hairline">
          <summary className="text-sm font-semibold text-foreground cursor-pointer">{f.p}</summary>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.r}</p>
        </details>
      ))}
    </section>
  );
}