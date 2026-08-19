import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ChevronDown, ChevronRight, Check, X, Loader2, AlertTriangle, Wrench
} from 'lucide-react';

const STATUS_META = {
  pending: { icon: Loader2, label: 'Pendiente', color: '#4A6FA5', spin: true },
  running: { icon: Loader2, label: 'Ejecutando', color: '#4A6FA5', spin: true },
  in_progress: { icon: Loader2, label: 'En progreso', color: '#F39C12', spin: true },
  completed: { icon: Check, label: 'Completado', color: '#27AE60', spin: false },
  success: { icon: Check, label: 'Listo', color: '#27AE60', spin: false },
  failed: { icon: X, label: 'Falló', color: '#D35400', spin: false },
  error: { icon: AlertTriangle, label: 'Error', color: '#D35400', spin: false },
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

  const toolName = toolCall.name || 'herramienta';
  const friendlyName = toolName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="mt-2 text-xs" style={{ border: '1px solid #1E2D4A', borderRadius: 6, background: '#0A1628' }}>
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        style={{ cursor: hideDetails ? 'default' : 'pointer' }}
      >
        {!hideDetails && (expanded
          ? <ChevronDown className="w-3 h-3 text-slate-500" />
          : <ChevronRight className="w-3 h-3 text-slate-500" />
        )}
        <Wrench className="w-3 h-3 text-slate-500" />
        <span className="font-mono text-slate-300">{friendlyName}</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono" style={{ color: effectiveFailed ? '#D35400' : meta.color }}>
          <Icon className={`w-3 h-3 ${meta.spin ? 'animate-spin' : ''}`} />
          {label}
        </span>
      </button>
      {expanded && !hideDetails && (
        <div className="px-3 pb-3 pt-1 space-y-2 font-mono" style={{ borderTop: '1px solid #1E2D4A' }}>
          {args && (
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#4A6FA5' }}>Parámetros</div>
              <pre className="text-slate-300 whitespace-pre-wrap break-words text-[11px]">{JSON.stringify(args, null, 2)}</pre>
            </div>
          )}
          {parsedResults !== null && parsedResults !== undefined && (
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#4A6FA5' }}>Resultado</div>
              <pre className="text-slate-300 whitespace-pre-wrap break-words text-[11px]">
                {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : String(parsedResults)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full md:max-w-[80%]'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#003399' }}>
              <span className="text-white text-[10px] font-bold">O</span>
            </div>
            <span className="text-[11px] font-mono" style={{ color: '#4A6FA5' }}>ORION</span>
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-lg ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={isUser
            ? { background: '#003399', color: 'white' }
            : { background: '#0D1526', border: '1px solid #1E2D4A', color: '#E2E8F0' }
          }
        >
          {message.content && (
            isUser
              ? <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              : <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
          )}
          {message.tool_calls?.map((tc, i) => <ToolCallDisplay key={i} toolCall={tc} />)}
        </div>
      </div>
    </div>
  );
}