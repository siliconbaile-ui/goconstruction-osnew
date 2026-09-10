import { base44 } from '@/api/base44Client';

export default async function goSessionContext() {
  const user = await base44.auth.me();
  return {
    name: `Sesión · ${new Date().toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
    description: 'GO principal de GoConstruction OS. Contexto de personalización de la interfaz; no concede permisos ni selecciona una obra automáticamente.',
    go_context: {
      workspace: 'goconstruction',
      nombre: user.full_name || '',
      cargo: user.cargo || 'sin especificar',
      empresa_id: user.empresa_id || null,
      proyectos_asignados: user.proyectos_asignados || [],
    },
  };
}