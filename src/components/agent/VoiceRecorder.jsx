import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Square, Loader2 } from 'lucide-react';

export default function VoiceRecorder({ onTranscript, disabled }) {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [estado, setEstado] = useState('idle');

  const detener = () => {
    recorderRef.current?.stop();
  };

  const iniciar = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      setEstado('transcribiendo');
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const file = new File([blob], 'nota-voz.webm', { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const texto = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      setEstado('idle');
      const limpio = typeof texto === 'string' ? texto.trim() : (texto?.transcript || '').trim();
      if (limpio) onTranscript(limpio);
    };
    recorderRef.current = recorder;
    recorder.start();
    setEstado('grabando');
  };

  const grabando = estado === 'grabando';
  const ocupado = estado === 'transcribiendo';

  return (
    <button
      onClick={grabando ? detener : iniciar}
      disabled={disabled || ocupado}
      title={grabando ? 'Detener y transcribir' : 'Hablar con Orion'}
      className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center disabled:opacity-50 ${grabando ? 'bg-surface-raised' : ''}`}
      style={{ color: grabando ? 'hsl(var(--danger))' : 'hsl(var(--muted-foreground))' }}
    >
      {ocupado ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
        : grabando ? <Square className="w-4 h-4" />
        : <Mic className="w-4 h-4" />}
    </button>
  );
}