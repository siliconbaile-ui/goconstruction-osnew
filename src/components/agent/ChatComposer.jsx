import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Paperclip, X, FileText, Volume2, VolumeX } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

export default function ChatComposer({ value, onChange, onSend, sending, onVoice, voiceMode, setVoiceMode }) {
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
    <div className="flex-shrink-0 px-4 lg:px-8 pb-5 pt-2">
      {files.length > 0 && (
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2 mb-2">
          {files.map(f => (
            <span key={f.url} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full text-[11px]"
              style={{ background: '#F1F4FB', border: '1px solid #DCE4F6', color: '#003399' }}>
              <FileText className="w-3 h-3" />
              <span className="max-w-[160px] truncate">{f.name}</span>
              <button onClick={() => setFiles(prev => prev.filter(x => x.url !== f.url))}
                className="p-0.5 rounded-full hover:bg-white" style={{ color: '#8A94A6' }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="max-w-3xl mx-auto flex items-center gap-2 pl-5 pr-2 py-2 rounded-full"
        style={{ background: '#FFFFFF', border: '1px solid #E4E0DA', boxShadow: '0 1px 2px rgba(20,24,33,0.04)' }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="habla o escríbele a Orion, o adjunta planillas, planos e informes"
          className="flex-1 bg-transparent outline-none text-sm py-2.5 min-w-0"
          style={{ color: '#141821' }}
        />
        <VoiceRecorder onTranscript={onVoice} disabled={sending || uploading} />
        <button onClick={() => setVoiceMode(!voiceMode)}
          className="p-2 rounded-full hover:bg-gray-100"
          style={voiceMode ? { background: '#E7F7EC', color: '#1E8449' } : { color: '#A8B0BF' }}
          title={voiceMode ? 'Respuestas en voz activadas' : 'Activar respuestas en voz'}>
          {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles}
          accept=".csv,.xlsx,.xls,.json,.pdf,.png,.jpg,.jpeg,.html" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50" style={{ color: '#A8B0BF' }} title="Adjuntar documentos">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#003399' }} /> : <Paperclip className="w-4 h-4" />}
        </button>
        <button
          onClick={enviar}
          disabled={(!value.trim() && files.length === 0) || sending || uploading}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: '#0A1E4D', color: 'white' }}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <p className="max-w-3xl mx-auto text-[10px] text-center mt-2" style={{ color: '#A8B0BF' }}>
        Orion opera con los datos reales de tu obra, analiza tus documentos y registra cada acción que ejecuta.
      </p>
    </div>
  );
}