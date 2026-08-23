import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Paperclip, X, FileText, Volume2, VolumeX } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

export default function ChatComposer({ value, onChange, onSend, sending, onVoice, voiceMode, setVoiceMode, hablando }) {
  const fileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(selected.map(async f => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        return { name: f.name, url: file_url };
      }));
      setFiles(prev => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const enviar = () => {
    if (uploading || sending) return;
    if (!value.trim() && files.length === 0) return;
    onSend(files.map(f => f.url));
    setFiles([]);
  };

  return (
    <div className="flex-shrink-0 px-3 sm:px-4 lg:px-8 pb-3 sm:pb-5 pt-2">
      {files.length > 0 && (
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2 mb-2">
          {files.map(f => (
            <span key={f.url} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full text-[11px] bg-surface-raised border border-hairline text-primary">
              <FileText className="w-3 h-3" />
              <span className="max-w-[160px] truncate">{f.name}</span>
              <button onClick={() => setFiles(prev => prev.filter(x => x.url !== f.url))}
                className="p-0.5 rounded-full text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Móvil: input arriba, acciones grandes abajo. Desktop: una sola fila. */}
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:pl-5 sm:pr-2 py-2 rounded-3xl sm:rounded-full bg-surface border border-hairline">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="habla o escríbele a GO"
          className="flex-1 bg-transparent outline-none text-base sm:text-sm px-2 sm:px-0 py-3 sm:py-2.5 min-w-0 text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <VoiceRecorder onTranscript={onVoice} disabled={sending || uploading} />
          <button onClick={() => setVoiceMode(!voiceMode)}
            className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${hablando ? 'animate-pulse' : ''} ${voiceMode ? 'bg-surface-raised' : ''}`}
            style={voiceMode ? { color: 'hsl(var(--ok))' } : { color: 'hsl(var(--muted-foreground))' }}
            title={hablando ? 'GO está hablando · toca para silenciar' : voiceMode ? 'Respuestas en voz activadas (voz técnica masculina)' : 'Activar respuestas en voz'}>
            {voiceMode ? <Volume2 className="w-5 h-5 sm:w-4 sm:h-4" /> : <VolumeX className="w-5 h-5 sm:w-4 sm:h-4" />}
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles}
            accept=".csv,.xlsx,.xls,.json,.pdf,.png,.jpg,.jpeg,.html" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-muted-foreground disabled:opacity-50"
            title="Adjuntar documentos">
            {uploading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin text-primary" /> : <Paperclip className="w-5 h-5 sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={enviar}
            disabled={(!value.trim() && files.length === 0) || sending || uploading}
            className="flex-1 sm:flex-none h-11 sm:w-10 sm:h-10 px-5 sm:px-0 rounded-full flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-40 text-sm font-semibold bg-primary text-primary-foreground"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="sm:hidden">Enviar</span>
          </button>
        </div>
      </div>
      <p className="max-w-3xl mx-auto text-[10px] text-center mt-2 hidden sm:block text-muted-foreground">
        GO opera con los datos reales de tu obra, analiza tus documentos y registra cada acción que ejecuta.
      </p>
    </div>
  );
}