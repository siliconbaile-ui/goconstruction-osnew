import { base44 } from '@/api/base44Client';

// Reproductor de voz de GO (ElevenLabs vía vozOrion).
// Un solo audio compartido y reproducción por tramos secuenciales: los mensajes
// largos ya no se cortan a mitad de camino.
let audio = null;
let turno = 0; // cancela la reproducción anterior al iniciar una nueva

const SILENCIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQQAAAAAAA==';

// Llamar dentro de un click/toque para habilitar audio en móvil.
export function desbloquearAudio() {
  if (!audio) audio = new Audio();
  audio.src = SILENCIO;
  audio.play().then(() => audio.pause()).catch(() => {});
}

export function limpiarParaVoz(texto) {
  return (texto || '')
    .split('\n')
    .filter(l => !/^\s*\|?[-:| ]+\|?\s*$/.test(l))
    .join('. ')
    .replace(/\|/g, ', ')
    .replace(/[*_#`>~]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/🟢/g, 'verde').replace(/🟡/g, 'amarillo').replace(/🔴/g, 'rojo')
    .replace(/\s+/g, ' ')
    // Pausas naturales de habla: respira en los dos puntos y tras cada cifra con
    // unidad, y no arrastra los guiones como si fueran parte de la frase.
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/:\s*/g, ': ')
    .replace(/([0-9]) ?%/g, '$1 por ciento')
    .trim()
    .slice(0, 4000);
}

// Corta en tramos largos respetando el fin de frase. Menos tramos = menos
// costuras entre audios.
function trocear(texto, max = 1200) {
  const frases = texto.match(/[^.!?;]+[.!?;]?/g) || [texto];
  const tramos = [];
  let actual = '';
  for (const f of frases) {
    if ((actual + f).length > max && actual) {
      tramos.push(actual.trim());
      actual = '';
    }
    actual += f;
  }
  if (actual.trim()) tramos.push(actual.trim());
  return tramos;
}

export function detenerAudio() {
  turno++;
  if (audio) { audio.pause(); audio.onended = null; }
  window.speechSynthesis?.cancel();
}

async function sintetizar(texto, voz, antes = '', despues = '') {
  try {
    const { data } = await base44.functions.invoke('vozOrion', { texto, voz, antes, despues });
    if (data?.audio_base64) return `data:audio/mp3;base64,${data.audio_base64}`;
  } catch { /* respaldo abajo */ }
  return null;
}

function reproducirSrc(src) {
  return new Promise((resolve) => {
    if (!audio) audio = new Audio();
    audio.src = src;
    // Último ajuste de ritmo: locución de terreno, sin apuro.
    audio.playbackRate = 0.96;
    audio.onended = resolve;
    audio.onerror = resolve;
    audio.play().catch(resolve);
  });
}

function hablarNativo(texto) {
  return new Promise((resolve) => {
    try {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-CL';
      u.rate = 0.88;
      u.pitch = 0.88;
      const voces = window.speechSynthesis.getVoices() || [];
      const masculina = voces.find(v => /es(-|_)(CL|419|MX|US)/i.test(v.lang) && /jorge|diego|juan|carlos|male|hombre/i.test(v.name))
        || voces.find(v => /es(-|_)(CL|419|MX)/i.test(v.lang));
      if (masculina) u.voice = masculina;
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.speak(u);
    } catch { resolve(); }
  });
}

// Lee el texto completo, tramo por tramo, sin cortes.
export async function reproducirTexto(contenido, onFin, voz = 'storm') {
  const texto = limpiarParaVoz(contenido);
  if (!texto) { onFin?.(); return; }
  detenerAudio();
  const miTurno = ++turno;
  const tramos = trocear(texto);

  // El siguiente tramo se sintetiza MIENTRAS suena el actual: al terminar uno,
  // el otro ya está listo y la lectura no se interrumpe.
  let siguiente = sintetizar(tramos[0], voz, '', tramos[1] || '');
  for (let i = 0; i < tramos.length; i++) {
    if (miTurno !== turno) return;
    const src = await siguiente;
    if (miTurno !== turno) return;
    siguiente = i + 1 < tramos.length
      ? sintetizar(tramos[i + 1], voz, tramos[i], tramos[i + 2] || '')
      : Promise.resolve(null);
    if (src) await reproducirSrc(src);
    else await hablarNativo(tramos[i]);
  }
  if (miTurno === turno) onFin?.();
}