import { useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import MarkdownContent from '@/components/agent/MarkdownContent';
import PolpaicoToolTrace from '@/components/polpaico/PolpaicoToolTrace';
import PolpaicoChatWelcome from '@/components/polpaico/PolpaicoChatWelcome';
export default function PolpaicoChatMessages({ messages, busy, onSend, data }) {
  const scroll=useRef(null);
  useEffect(()=>{if(scroll.current)scroll.current.scrollTop=scroll.current.scrollHeight;},[messages,busy]);
  return <div ref={scroll} data-scroll-area className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3"><div className="max-w-3xl mx-auto">{!messages.length?<PolpaicoChatWelcome data={data} onSend={onSend} disabled={busy}/>:<div className="space-y-5 py-4">{messages.filter(m=>['user','assistant'].includes(m.role)).map((m,i)=><div key={m.id||i} className={m.role==='user'?'flex justify-end':'flex items-start gap-3'}>{m.role==='assistant'&&<span className="p-2 bg-primary/25 rounded-lg shrink-0 mt-1"><Sparkles className="w-4 h-4 text-ok" /></span>}<div className={m.role==='user'?'max-w-[90%] rounded-2xl rounded-tr-sm bg-secondary p-4 text-sm':'min-w-0 flex-1'}>{m.role==='user'?<p className="whitespace-pre-wrap">{m.content}</p>:<>{(m.tool_calls||[]).map((t,j)=><PolpaicoToolTrace key={t.id||j} tool={t} />)}{m.content&&<MarkdownContent content={m.content}/>}</>}{m.file_urls?.map((url,j)=><a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs underline mt-2">Adjunto {j+1}</a>)}</div></div>)}</div>}{busy&&<div role="status" className="flex gap-2 items-center text-xs text-muted-foreground py-4"><Loader2 className="w-4 h-4 animate-spin text-ok"/>GO está trabajando con los registros del piloto…</div>}</div></div>;
}