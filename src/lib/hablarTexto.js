import { base44 } from '@/api/base44Client';

// Reproduce un texto con la voz de GO (ElevenLabs vía vozOrion).
// Un solo audio compartido: al pedir otro, se corta el anterior.
let audio = null;

function limpiar(texto) {
  return texto
    .split('\n')
    .filter(l => !/^\s*\|?[-:| ]+\|?\s*$/.test(l))
    .join('. ')
    .replace(/\|/g, ', ')
    .replace(/[*_#`>~]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 900);
}

export function detenerAudio() {
  audio?.pause();
  window.speechSynthesis?.cancel();
}

export async function reproducirTexto(contenido, onFin) {
  const texto = limpiar(contenido || '');
  if (!texto) return;
  detenerAudio();
  let src = null;
  try {
    const { data } = await base44.functions.invoke('vozOrion', { texto, voz: 'storm' });
    if (data?.audio_base64) src = `data:audio/mp3;base64,${data.audio_base64}`;
  } catch { src = null; }

  if (!src) {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-CL';
    u.pitch = 0.9;
    u.onend = () => onFin?.();
    window.speechSynthesis.speak(u);
    return;
  }

  if (!audio) audio = new Audio();
  audio.src = src;
  audio.onended = () => onFin?.();
  audio.onerror = () => onFin?.();
  await audio.play();
}