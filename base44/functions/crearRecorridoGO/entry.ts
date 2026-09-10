import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const routes = new Set([
  '/app', '/vision-urgente', '/dashboard', '/monitor-avance', '/qa-terreno',
  '/evidencia-terreno', '/gestor-rdi', '/semaforo-pagos', '/centro-alertas',
  '/informe-ejecutivo', '/base-conocimiento', '/sincronizacion', '/configuracion',
  '/polpaico-os'
]);

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const rawSteps = Array.isArray(body.steps) ? body.steps : [];
    if (rawSteps.length < 1 || rawSteps.length > 18) {
      return Response.json({ error: 'El recorrido debe tener entre 1 y 18 pasos.' }, { status: 400 });
    }
    const steps = rawSteps.map((step, index) => {
      const route = String(step.route || '');
      const narration = String(step.narration || '').trim();
      const target = String(step.target || '').trim();
      if (!routes.has(route)) throw new Error(`Ruta no permitida en paso ${index + 1}.`);
      if (narration.length < 12 || narration.length > 700) throw new Error(`Narración inválida en paso ${index + 1}.`);
      if (target && !/^[a-z0-9-]{1,80}$/.test(target)) throw new Error(`Objetivo inválido en paso ${index + 1}.`);
      return {
        route,
        narration,
        target: target || null,
        interaction: ['focus', 'click'].includes(step.interaction) ? step.interaction : 'focus',
        hold_ms: Math.min(Math.max(Number(step.hold_ms) || 1200, 500), 5000)
      };
    });
    return Response.json({
      success: true,
      demonstration: true,
      plan: {
        id: crypto.randomUUID(),
        title: String(body.title || 'Recorrido dirigido por GO').slice(0, 100),
        voice: ['honey', 'river', 'storm'].includes(body.voice) ? body.voice : 'honey',
        steps
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}