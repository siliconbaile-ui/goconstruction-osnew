import { useState } from 'react';
import { Bot, ArrowUp, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import useGoModuleChat, { visibleGoMessage } from './useGoModuleChat';

export default function GoModuleAssist({ area, priorities, snapshot, loading }) {
  const [input, setInput] = useState('');
  const { messages, conversation, busy, error, send } = useGoModuleChat(area, snapshot);
  const submit = async text => { if (await send(text)) setInput(''); };
  return <section className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5" aria-label={`GO en ${area}`}>
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></span>
      <div><h2 className="font-heading text-base font-semibold text-foreground">GO · {area}</h2><p className="text-xs text-muted-foreground">Prioridades según los registros visibles · confirma antes de actuar</p></div>
    </div>
    {loading ? <p className="py-3 text-xs text-muted-foreground">Revisando registros...</p> : priorities.length ?
      <div className="mb-4 grid gap-2 sm:grid-cols-2">{priorities.map(item => <article key={item.title} className="rounded-xl border border-hairline bg-surface-raised p-3">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Siguiente paso</span>
        <h3 className="mt-1 text-sm font-semibold text-foreground">{item.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
        <button type="button" disabled={busy} onClick={() => submit(item.prompt)} className="mt-3 min-h-10 rounded-lg border border-hairline px-3 text-xs font-semibold text-primary disabled:opacity-50">Consultar a GO</button>
      </article>)}</div> : <p className="mb-4 rounded-xl border border-hairline bg-surface-raised p-3 text-xs text-muted-foreground">No hay pendientes prioritarios en los registros cargados. Puedes consultar a GO sobre esta sección.</p>}
    {messages.length > 0 && <div role="log" aria-live="polite" className="mb-3 max-h-96 space-y-4 overflow-y-auto rounded-xl border border-hairline bg-surface-base p-3">{messages.map((message, i) => <MessageBubble key={message.id || i} message={visibleGoMessage(message)} conversacionId={conversation?.id} />)}</div>}
    {error && <p role="alert" className="mb-2 text-xs text-danger">{error}</p>}
    <form onSubmit={e => { e.preventDefault(); submit(input); }} className="flex items-end gap-2">
      <label htmlFor={`go-${area}`} className="sr-only">Consulta a GO en {area}</label>
      <input id={`go-${area}`} value={input} onChange={e => setInput(e.target.value)} placeholder={`Pregunta a GO sobre ${area.toLowerCase()}...`} className="min-w-0 min-h-11 flex-1 rounded-xl border border-hairline bg-surface-raised px-3 text-sm text-foreground placeholder:text-muted-foreground" />
      <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar consulta" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}</button>
    </form>
  </section>;
}