import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Voces neuronales profesionales de Google Cloud en español latinoamericano.
// Chirp3-HD entrega la locución más natural disponible para es-US (LatAm neutro,
// el registro que usan los equipos de obra en Chile).
const VOCES = {
  river: 'es-US-Chirp3-HD-Aoede',   // femenina, calma y clara (por defecto)
  storm: 'es-US-Chirp3-HD-Charon',  // masculina, autoridad de mando
  honey: 'es-US-Chirp3-HD-Leda',    // femenina, cálida
  spark: 'es-US-Chirp3-HD-Puck',    // masculina, enérgica
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { texto, voz = 'river', velocidad = 1.0 } = await req.json();
    if (!texto || !texto.trim()) {
      return Response.json({ error: 'Texto requerido' }, { status: 400 });
    }

    const apiKey = secrets.get('GOOGLE_CLOUD_TTS_API_KEY');
    const name = VOCES[voz] || VOCES.river;

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: texto.slice(0, 4500) },
          voice: { languageCode: 'es-US', name },
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
      return Response.json(
        { error: data?.error?.message || 'Error de Google TTS' },
        { status: 502 }
      );
    }

    return Response.json({ audio_base64: data.audioContent, voz: name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}