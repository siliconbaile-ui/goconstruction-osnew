import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Square, Loader2 } from 'lucide-react';

const Reconocimiento = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

// Dictado en vivo: el texto aparece en el campo palabra por palabra mientras
// hablas. El reconocimiento se reinicia solo cuando el navegador lo corta por
// silencio, así puedes dictar párrafos largos sin perder nada. El mensaje se
// envía únicamente cuando TÚ detienes el micrófono.
export default function VoiceRecorder({ onTranscript, onPartial, disabled }) {
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const finalRef = useRef('');
  const detenidoRef = useRef(false);
  const [estado, setEstado] = useState('idle');

  const detener = () => {
    if (recognitionRef.current) {
      detenidoRef.current = true;
      recognitionRef.current.stop();
      return;
    }
    recorderRef.current?.stop();
  };

  const crearReconocimiento = () => {
    const rec = new Reconocimiento();
    rec.lang = 'es-CL';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalRef.current += t + ' ';
        else interim += t;
      }
      onPartial?.((finalRef.current + interim).trimStart());
    };
    rec.onerror = (e) => {
      // 'no-speech' / 'aborted' son cortes normales: se reintenta en onend.
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        detenidoRef.current = true;
      }
    };
    rec.onend = () => {
      // Reinicio automático mientras el usuario siga dictando.
      if (!detenidoRef.current) {
        try {
          const nuevo = crearReconocimiento();
          recognitionRef.current = nuevo;
          nuevo.start();
          return;
        } catch { /* cae al cierre */ }
      }
      recognitionRef.current = null;
      setEstado('idle');
      const texto = finalRef.current.trim();
      if (texto) onTranscript(texto);
    };
    return rec;
  };

  const iniciarVivo = () => {
    finalRef.current = '';
    detenidoRef.current = false;
    const rec = crearReconocimiento();
    recognitionRef.current = rec;
    rec.start();
    setEstado('grabando');
  };

  const iniciarGrabacion = async () => {
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

  const iniciar = () => (Reconocimiento ? iniciarVivo() : iniciarGrabacion());

  const grabando = estado === 'grabando';
  const ocupado = estado === 'transcribiendo';

  return (
    <button
      onClick={grabando ? detener : iniciar}
      disabled={disabled || ocupado}
      title={grabando ? 'Detener y enviar' : 'Dictar a GO (transcripción en vivo)'}
      className={`relative w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center disabled:opacity-50 ${grabando ? 'bg-surface-raised' : ''}`}
      style={{ color: grabando ? 'hsl(var(--danger))' : 'hsl(var(--muted-foreground))' }}
    >
      {grabando && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'hsl(var(--danger) / 0.18)' }} />}
      {ocupado ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
        : grabando ? <Square className="w-4 h-4" />
        : <Mic className="w-4 h-4" />}
    </button>
  );
}