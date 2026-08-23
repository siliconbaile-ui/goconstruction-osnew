import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Motor principal: ElevenLabs (eleven_multilingual_v2), la voz más natural
// disponible en español. Respaldo: Google Cloud Chirp3-HD si ElevenLabs falla.
// GO habla con voz MASCULINA, técnica y serena: registro de arquitecto/ITO chileno.
const VOCES_11L = {
  storm: 'onwK4e9ZLuTAKqWW03F9',  // Daniel · masculina, grave y técnica (GO por defecto)
  spark: 'JBFqnCBsd6RMkjVDRZzb',  // George · masculina, autoridad de mando
  river: 'onwK4e9ZLuTAKqWW03F9',  // alias legado → voz de GO
  honey: 'TX3LPaxmHKxFdv7VOQHJ',  // Liam · masculina, más joven
};

const VOCES_GOOGLE = {
  storm: 'es-US-Chirp3-HD-Alnilam',
  spark: 'es-US-Chirp3-HD-Puck',
  river: 'es-US-Chirp3-HD-Alnilam',
  honey: 'es-US-Chirp3-HD-Puck',
};

function aBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const paso = 0x8000;
  for (let i = 0; i < bytes.length; i += paso) {
    bin += String.fromCharCode(...bytes.subarray(i, i + paso));
  }
  return btoa(bin);
}

async function sintetizarElevenLabs(texto, voz) {
  const apiKey = secrets.get('ELEVENLABS_API_KEY');
  const voiceId = VOCES_11L[voz] || VOCES_11L.storm;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: texto,
        model_id: 'eleven_multilingual_v2',
        language_code: 'es',
        // Locución sobria y estable: informe técnico de terreno, sin dramatismo.
        voice_settings: { stability: 0.7, similarity_boost: 0.85, style: 0.1, use_speaker_boost: true },
      }),
    }
  );
  if (!res.ok) {
    const detalle = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${detalle.slice(0, 200)}`);
  }
  return aBase64(await res.arrayBuffer());
}

async function sintetizarGoogle(texto, voz, velocidad) {
  const apiKey = secrets.get('GOOGLE_CLOUD_TTS_API_KEY');
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: texto },
        voice: { languageCode: 'es-US', name: VOCES_GOOGLE[voz] || VOCES_GOOGLE.storm },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: velocidad,
          sampleRateHertz: 24000,
          effectsProfileId: ['handset-class-device'],
        },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || !data.audioContent) {
    throw new Error(data?.error?.message || 'Error de Google TTS');
  }
  return data.audioContent;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { texto, voz = 'storm', velocidad = 1.0 } = await req.json();
    if (!texto || !texto.trim()) {
      return Response.json({ error: 'Texto requerido' }, { status: 400 });
    }
    const limpio = texto.slice(0, 2500);

    try {
      const audio = await sintetizarElevenLabs(limpio, voz);
      return Response.json({ audio_base64: audio, motor: 'elevenlabs' });
    } catch (e) {
      console.warn('ElevenLabs falló, usando respaldo Google:', e.message);
      const audio = await sintetizarGoogle(limpio, voz, velocidad);
      return Response.json({ audio_base64: audio, motor: 'google' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}