import { Send, Loader2, Mic, Paperclip } from 'lucide-react';

export default function ChatComposer({ value, onChange, onSend, sending }) {
  return (
    <div className="flex-shrink-0 px-4 lg:px-8 pb-5 pt-2">
      <div className="max-w-3xl mx-auto flex items-center gap-2 pl-5 pr-2 py-2 rounded-full"
        style={{ background: '#FFFFFF', border: '1px solid #E4E0DA', boxShadow: '0 1px 2px rgba(20,24,33,0.04)' }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder="pídele algo a Orion: escala la alerta NC-0001 a gerencia media"
          className="flex-1 bg-transparent outline-none text-sm py-2.5 min-w-0"
          style={{ color: '#141821' }}
        />
        <button className="p-2 rounded-full hover:bg-gray-100 hidden sm:block" style={{ color: '#A8B0BF' }} title="Adjuntar">
          <Paperclip className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 hidden sm:block" style={{ color: '#A8B0BF' }} title="Dictar">
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={onSend}
          disabled={!value.trim() || sending}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: '#0A1E4D', color: 'white' }}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <p className="max-w-3xl mx-auto text-[10px] text-center mt-2" style={{ color: '#A8B0BF' }}>
        Orion opera con los datos reales de tu obra y registra cada acción que ejecuta.
      </p>
    </div>
  );
}