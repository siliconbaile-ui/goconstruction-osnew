// Perfiles operacionales de una constructora chilena. El `cargo` define el
// registro con que GO le habla al usuario y qué módulos le importan; el `role`
// de plataforma (admin/user) define permisos de administración.
export const CARGOS = [
  { value: 'gerencia', label: 'Gerencia', desc: 'Semáforo, desviación y decisiones', rol_sugerido: 'admin' },
  { value: 'administrador_obra', label: 'Administrador de Obra', desc: 'Plata, plazo, subcontratos y EDPs', rol_sugerido: 'admin' },
  { value: 'jefe_terreno', label: 'Jefe de Terreno', desc: 'Frentes del día, avance y NCs', rol_sugerido: 'user' },
  { value: 'jefe_calidad', label: 'Jefe de Calidad', desc: 'Inspecciones, PPI y cierre de NCs', rol_sugerido: 'user' },
  { value: 'oficina_tecnica', label: 'Oficina Técnica', desc: 'RDIs, planos, EETT y cubicaciones', rol_sugerido: 'user' },
  { value: 'prevencionista', label: 'Prevencionista', desc: 'DS 594, Ley 16.744 y riesgos', rol_sugerido: 'user' },
  { value: 'capataz', label: 'Capataz', desc: 'Registro en terreno por WhatsApp', rol_sugerido: 'user' },
];

export const labelCargo = (v) => CARGOS.find(c => c.value === v)?.label || 'Sin cargo';