import React, { useState } from 'react';
import MarkdownContent from './MarkdownContent';
import {
  ChevronDown, ChevronRight, Check, X, Loader2, AlertTriangle, FileText
} from 'lucide-react';
import SmartDataCard from './SmartDataCard';
import MessageActions from './MessageActions';
import toolMeta from '@/lib/toolMeta';

const STATUS_META = {
  pending: { icon: Loader2, label: 'Pendiente', color: 'hsl(var(--muted-foreground))', spin: true },
  running: { icon: Loader2, label: 'Ejecutando', color: 'hsl(var(--muted-foreground))', spin: true },
  in_progress: { icon: Loader2, label: 'En progreso', color: 'hsl(var(--warn))', spin: true },
  completed: { icon: Check, label: 'Completado', color: 'hsl(var(--ok))', spin: false },
  success: { icon: Check, label: 'Listo', color: 'hsl(var(--ok))', spin: false },
  failed: { icon: X, label: 'Falló', color: 'hsl(var(--danger))', spin: false },
  error: { icon: AlertTriangle, label: 'Error', color: 'hsl(var(--danger))', spin: false },
};

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status || 'pending';
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  const proj = toolCall.display_projection || {};
  const hideDetails = proj.hide_details && proj.details_redacted;

  const failed = status === 'failed' || status === 'error';
  const parsedResults = (() => {
    if (!toolCall.results) return null;
    try {
      return typeof toolCall.results === 'string' ? JSON.parse(toolCall.results) : toolCall.results;
    } catch {
      return toolCall.results;
    }
  })();
  const resultIsError = parsedResults && typeof parsedResults === 'object' &&
    (parsedResults.success === false || /error|failed/i.test(JSON.stringify(parsedResults)));
  const effectiveFailed = failed || resultIsError;

  let label = meta.label;
  if (proj.active_label && ['pending', 'running', 'in_progress'].includes(status)) label = proj.active_label;
  if (proj.error_label && effectiveFailed) label = proj.error_label;
  if (proj.label && !effectiveFailed && status === 'success') label = proj.label;

  let args = null;
  try { args = toolCall.arguments_string ? JSON.parse(toolCall.arguments_string) : null; }
  catch { args = toolCall.arguments_string; }

  const tarea = toolMeta(toolCall.name || '');
  const TareaIcon = tarea.icon;
  const friendlyName = (toolCall.name || 'herramienta').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const records = Array.isArray(parsedResults) ? parsedResults
    : Array.isArray(parsedResults?.data) ? parsedResults.data
    : Array.isArray(parsedResults?.results) ? parsedResults.results
    : null;
  const showCards = !hideDetails && !effectiveFailed && records && records.length > 0 &&
    typeof records[0] === 'object' && records[0] !== null;

  return (
    <div className="mt-2 text-xs rounded-xl overflow-hidden bg-surface-raised border border-hairline"
      style={{ borderLeft: `3px solid ${effectiveFailed ? 'hsl(var(--danger))' : tarea.color}` }}>
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        style={{ cursor: hideDetails ? 'default' : 'pointer' }}
      >
        {!hideDetails && (expanded
          ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
          : <ChevronRight className="w-3 h-3 text-muted-foreground" />
        )}
        <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: tarea.colorSuave }}>
          <TareaIcon className="w-3 h-3" style={{ color: tarea.color }} />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold truncate text-foreground/85">{tarea.titulo}</span>
          <span className="block font-mono text-[9px] truncate text-muted-foreground">{friendlyName}</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono" style={{ color: effectiveFailed ? 'hsl(var(--danger))' : meta.color }}>
          <Icon className={`w-3 h-3 ${meta.spin ? 'animate-spin' : ''}`} />
          {label}
        </span>
      </button>
      {showCards && !expanded && (
        <div className="px-3 pb-3">
          <SmartDataCard records={records} />
        </div>
      )}
      {expanded && !hideDetails && (
        <div className="px-3 pb-3 pt-1 space-y-2 font-mono border-t border-hairline">
          {args && (
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1 text-muted-foreground">Parámetros</div>
              <pre className="whitespace-pre-wrap break-words text-[11px] text-foreground/80">{JSON.stringify(args, null, 2)}</pre>
            </div>
          )}
          {parsedResults !== null && parsedResults !== undefined && (
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1 text-muted-foreground">Resultado</div>
              <pre className="whitespace-pre-wrap break-words text-[11px] text-foreground/80">
                {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : String(parsedResults)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message, conversacionId }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full md:max-w-[80%]'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
              <span className="text-primary-foreground text-[9px] font-bold">GO</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">GO</span>
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl ${isUser
            ? 'rounded-tr-sm bg-primary text-primary-foreground'
            : 'rounded-tl-sm bg-surface border border-hairline text-foreground'}`}
        >
          {message.content && (
            isUser
              ? <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              : <MarkdownContent content={message.content} />
          )}
          {message.file_urls?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {message.file_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono ${isUser ? 'bg-white/15 text-white' : 'bg-surface-raised text-primary'}`}>
                  <FileText className="w-3 h-3" /> DOC {i + 1}
                </a>
              ))}
            </div>
          )}
          {message.tool_calls?.map((tc, i) => <ToolCallDisplay key={i} toolCall={tc} />)}
        </div>
        {!isUser && message.content && (
          <MessageActions content={message.content} conversacionId={conversacionId} />
        )}
      </div>
    </div>
  );
}