export default function BloqueManual({ numero, titulo, bajada, children, id }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-[10px] font-mono tracking-widest text-primary">{numero}</span>
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">{titulo}</h2>
      </div>
      {bajada && <p className="text-sm leading-relaxed mb-5 max-w-2xl text-muted-foreground">{bajada}</p>}
      {children}
    </section>
  );
}