import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import MarkdownContent from '@/components/agent/MarkdownContent';
import PublicGoWelcome from '@/components/publicgo/PublicGoWelcome';

export default function PublicGoMessages({ messages, busy, onPrompt }) {
  const scroll = useRef(null);
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [messages, busy]);
  return (
    <div ref={scroll} data-scroll-area className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
      {!messages.length ? <PublicGoWelcome busy={busy} onPrompt={onPrompt} /> : <div role="log" aria-label="Conversación con GO" className="mx-auto max-w-5xl space-y-5">
        {messages.filter(m => ['user', 'assistant'].includes(m.role)).map((message, index) => <article key={message.id || index} className={message.role === 'user' ? 'ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-primary p-4 text-primary-foreground' : 'min-w-0 rounded-2xl rounded-tl-sm border border-hairline bg-surface p-4 sm:p-5'}>
          {message.role === 'user' ? <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p> : <>
            <p className="mb-2 text-xs font-semibold text-primary">GO · análisis de demostración</p>
            {message.tool_calls?.map((tool, i) => {
              const failed = ['failed', 'error'].includes(tool.status) || tool.results?.success === false || Boolean(tool.results?.error) || (typeof tool.results === 'string' && /"(?:error|success)"\s*:\s*(?:"[^"\s]|false)/i.test(tool.results));
              const running = ['pending', 'running', 'in_progress'].includes(tool.status);
              const projection = tool.display_projection;
              const label = projection?.hide_details && projection?.details_redacted ? (failed ? projection.error_label : running ? projection.active_label : projection.label) : failed ? 'No se pudo completar la consulta' : running ? 'Consultando evidencia de la demo…' : 'Consulta de evidencia completada';
              return <p key={tool.id || i} className="mb-2 text-xs text-muted-foreground">{label}</p>;
            })}
            {message.content && <MarkdownContent content={message.content} />}
          </>}
        </article>)}
      </div>}
      {busy && <p role="status" className="mx-auto mt-4 flex max-w-5xl items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" />GO está analizando tu consulta…</p>}
    </div>
  );
}