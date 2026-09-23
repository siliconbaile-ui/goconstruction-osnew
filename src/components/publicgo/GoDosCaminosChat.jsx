import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import MarkdownContent from '@/components/agent/MarkdownContent';
import usePublicGo from '@/components/publicgo/usePublicGo';

export default function GoDosCaminosChat({ agentName }) {
  const { messages, busy, error, send } = usePublicGo(agentName);
  const [text, setText] = useState('');
  const incorporar = agentName === 'go_incorporacion';
  const enviar = async () => { if (await send(text)) setText(''); };
  return <div className="flex min-h-0 flex-1 flex-col">
    <div role="log" aria-label={incorporar ? 'Conversación de incorporación' : 'Consulta técnica con GO'} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        {!messages.length && <div className="rounded-2xl border border-hairline bg-surface p-5 text-sm leading-relaxed">{incorporar ? 'Cuéntame qué necesitas para avanzar con tu empresa y el Centro de Comando. Puedes preguntar sin crear una cuenta todavía.' : 'Pregúntame sobre obra, calidad, avance, RDIs o pagos. Puedo analizar la obra de demostración sin acceder a datos privados.'}</div>}
        {messages.filter(m => ['user', 'assistant'].includes(m.role)).map((m, i) => <div key={m.id || i} className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-2xl bg-primary p-4 text-sm text-primary-foreground' : 'rounded-2xl border border-hairline bg-surface p-4 text-sm'}>{m.role === 'user' ? <p className="whitespace-pre-wrap">{m.content}</p> : <MarkdownContent content={m.content || ''} />}</div>)}
        {busy && <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> GO está respondiendo…</p>}
      </div>
    </div>
    <div className="shrink-0 border-t border-hairline bg-surface-base p-3 sm:p-5">
      <form onSubmit={e => { e.preventDefault(); enviar(); }} className="mx-auto max-w-3xl">
        {error && <p role="alert" className="mb-2 text-sm text-destructive">{error}</p>}
        <div className="flex items-end gap-2 rounded-2xl border border-hairline bg-surface p-2"><textarea aria-label="Escribe a GO" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviar(); } }} placeholder="Escríbele a GO…" rows={2} className="min-h-12 flex-1 resize-none bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground" /><button type="submit" disabled={busy || !text.trim()} aria-label="Enviar mensaje" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" /></button></div>
        <p className="mt-2 text-center text-xs text-muted-foreground">{incorporar ? <>Para operar tu obra real, <Link className="text-primary underline" to="/register?returnTo=%2Fapp">crea tu acceso</Link> o <Link className="text-primary underline" to="/login?returnTo=%2Fapp">entra a la app</Link>.</> : 'Solo datos de demostración. No compartas documentos privados aquí.'}</p>
      </form>
    </div>
  </div>;
}