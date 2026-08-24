// SISTEMA DE TEMAS · GoConstruction OS
// Seis paletas completas, cada una con variante OSCURA y CLARA. El switch
// oscuro/claro del header opera SOBRE la paleta activa: la marca se mantiene,
// cambia la luz. Todos los tokens del sistema están definidos en ambas
// variantes, así que ninguna pantalla queda sin contraste.
//
// Lectura cromática 2026/27 para software de obra: oscuro como línea base,
// superficies estratificadas en vez de bordes duros, un único color de marca
// saturado reservado a la voz del agente y a la acción, y semáforo operacional
// legible a pleno sol.

const SEMAFORO_DARK = { ok: '152 52% 46%', warn: '38 92% 58%', danger: '6 78% 58%' };
const SEMAFORO_LIGHT = { ok: '152 52% 28%', warn: '30 88% 34%', danger: '6 74% 42%' };

export const TEMAS = [
  {
    id: 'faena_nocturna',
    nombre: 'Faena Nocturna',
    claim: 'El tema por defecto del OS',
    concepto: 'Negro cálido de hormigón sellado con cobre de faena. La marca es la luz de trabajo: el ámbar solo aparece donde hay una decisión que tomar.',
    uso: 'Turnos largos, control nocturno, pantallas siempre encendidas en sala de operación.',
    swatches: { dark: ['#0B0908', '#141110', '#E8912E', '#39B37A', '#E5442F'], light: ['#FAF7F2', '#FFFFFF', '#A85A12', '#22694A', '#B32E1E'] },
    tokens: {
      dark: {
        background: '30 12% 4%', foreground: '36 30% 95%',
        primary: '34 82% 58%', 'primary-foreground': '30 40% 8%',
        muted: '30 10% 11%', 'muted-foreground': '34 14% 70%',
        'surface-0': '30 12% 4%', 'surface-1': '30 12% 7%', 'surface-2': '30 11% 12%',
        hairline: '32 14% 19%', info: '34 82% 62%', ...SEMAFORO_DARK,
      },
      light: {
        background: '36 30% 97%', foreground: '28 22% 12%',
        primary: '28 78% 36%', 'primary-foreground': '0 0% 100%',
        muted: '32 20% 92%', 'muted-foreground': '28 12% 36%',
        'surface-0': '36 30% 97%', 'surface-1': '0 0% 100%', 'surface-2': '34 22% 93%',
        hairline: '30 16% 84%', info: '28 78% 38%', ...SEMAFORO_LIGHT,
      },
    },
  },
  {
    id: 'acero_frio',
    nombre: 'Acero Frío',
    claim: 'Precisión de ingeniería',
    concepto: 'Azul acero sobre grafito azulado. Cromática neutra y fría que deja hablar a los datos: la tabla y el número mandan, el color solo clasifica.',
    uso: 'Gerencia, mandante e ITO. Curvas S, comités y reportes donde el color no debe opinar.',
    swatches: { dark: ['#0D131B', '#151E29', '#2A9BF0', '#2FBE93', '#E8434F'], light: ['#F4F7FA', '#FFFFFF', '#0F5FA8', '#1C6B52', '#B22F3A'] },
    tokens: {
      dark: {
        background: '215 28% 7%', foreground: '210 30% 96%',
        primary: '205 90% 55%', 'primary-foreground': '215 45% 8%',
        muted: '215 20% 13%', 'muted-foreground': '213 16% 70%',
        'surface-0': '215 28% 7%', 'surface-1': '215 26% 10%', 'surface-2': '215 22% 15%',
        hairline: '215 20% 20%', info: '205 90% 62%', ...SEMAFORO_DARK,
      },
      light: {
        background: '210 30% 97%', foreground: '215 35% 12%',
        primary: '208 82% 36%', 'primary-foreground': '0 0% 100%',
        muted: '210 20% 93%', 'muted-foreground': '215 14% 36%',
        'surface-0': '210 30% 97%', 'surface-1': '0 0% 100%', 'surface-2': '210 22% 94%',
        hairline: '212 16% 84%', info: '208 82% 38%', ...SEMAFORO_LIGHT,
      },
    },
  },
  {
    id: 'blueprint_cian',
    nombre: 'Blueprint Cian',
    claim: 'Herencia del plano',
    concepto: 'Azul de plano heliográfico con cian de trazo. El linaje del blueprint en pantalla: fondo profundo, línea luminosa, cero ruido decorativo.',
    uso: 'Base de conocimiento, lectura de planos y EETT, consultas técnicas con cita de página.',
    swatches: { dark: ['#070D18', '#0D1626', '#0FCBE0', '#2BC79A', '#F0405C'], light: ['#F2F7F9', '#FFFFFF', '#0A6E7C', '#1C6B52', '#B22F3A'] },
    tokens: {
      dark: {
        background: '222 45% 6%', foreground: '200 25% 95%',
        primary: '189 92% 48%', 'primary-foreground': '200 65% 8%',
        muted: '222 30% 13%', 'muted-foreground': '210 20% 70%',
        'surface-0': '222 45% 6%', 'surface-1': '222 40% 9%', 'surface-2': '222 32% 14%',
        hairline: '220 28% 19%', info: '189 92% 55%', ...SEMAFORO_DARK,
      },
      light: {
        background: '195 30% 97%', foreground: '215 40% 12%',
        primary: '190 72% 28%', 'primary-foreground': '0 0% 100%',
        muted: '195 20% 92%', 'muted-foreground': '205 16% 34%',
        'surface-0': '195 30% 97%', 'surface-1': '0 0% 100%', 'surface-2': '195 22% 93%',
        hairline: '198 18% 83%', info: '190 72% 30%', ...SEMAFORO_LIGHT,
      },
    },
  },
  {
    id: 'grafito_lima',
    nombre: 'Grafito Lima',
    claim: 'Prevención primero',
    concepto: 'Grafito neutro con verde lima de chaleco reflectante. El tema de la seguridad: lo urgente resalta con la señal que el trabajador ya reconoce en terreno.',
    uso: 'Prevención de riesgos, no conformidades, alertas críticas y visión urgente.',
    swatches: { dark: ['#0F0F10', '#171718', '#C6E62B', '#33C46E', '#E5432E'], light: ['#F6F6F4', '#FFFFFF', '#4F6304', '#22694A', '#B32E1E'] },
    tokens: {
      dark: {
        background: '220 6% 6%', foreground: '60 8% 95%',
        primary: '74 78% 52%', 'primary-foreground': '80 50% 9%',
        muted: '220 5% 13%', 'muted-foreground': '220 6% 70%',
        'surface-0': '220 6% 6%', 'surface-1': '220 6% 9%', 'surface-2': '220 5% 14%',
        hairline: '220 6% 19%', info: '74 78% 56%', ...SEMAFORO_DARK,
      },
      light: {
        background: '75 14% 96%', foreground: '80 15% 12%',
        primary: '78 88% 21%', 'primary-foreground': '0 0% 100%',
        muted: '75 12% 92%', 'muted-foreground': '80 10% 34%',
        'surface-0': '75 14% 96%', 'surface-1': '0 0% 100%', 'surface-2': '75 12% 93%',
        hairline: '75 12% 83%', info: '78 88% 23%', ...SEMAFORO_LIGHT,
      },
    },
  },
  {
    id: 'cal_terracota',
    nombre: 'Cal Terracota',
    claim: 'Terreno a pleno sol',
    concepto: 'Cal blanca y terracota cocida. Contraste alto y color cálido sin brillo: pensado para leerse en un teléfono al sol y con guantes puestos.',
    uso: 'Uso móvil en obra, inspecciones, evidencia fotográfica y firmas en terreno.',
    swatches: { dark: ['#14100E', '#1D1714', '#E2703A', '#39B37A', '#E5442F'], light: ['#F8F5F0', '#FFFFFF', '#B4522B', '#22694A', '#B32E1E'] },
    tokens: {
      dark: {
        background: '20 14% 5%', foreground: '30 25% 95%',
        primary: '18 80% 56%', 'primary-foreground': '20 40% 8%',
        muted: '20 12% 12%', 'muted-foreground': '24 14% 70%',
        'surface-0': '20 14% 5%', 'surface-1': '20 14% 8%', 'surface-2': '20 12% 13%',
        hairline: '20 14% 20%', info: '18 80% 60%', ...SEMAFORO_DARK,
      },
      light: {
        background: '34 32% 97%', foreground: '20 24% 12%',
        primary: '14 64% 38%', 'primary-foreground': '0 0% 100%',
        muted: '30 20% 92%', 'muted-foreground': '20 14% 34%',
        'surface-0': '34 32% 97%', 'surface-1': '0 0% 100%', 'surface-2': '32 22% 93%',
        hairline: '28 18% 83%', info: '14 64% 40%', ...SEMAFORO_LIGHT,
      },
    },
  },
  {
    id: 'arena_bruta',
    nombre: 'Arena Bruta',
    claim: 'Documento oficial',
    concepto: 'Arena de hormigón fresco con óxido de fierro. Registro sobrio y documental: se ve igual de bien en pantalla que impreso en un estado de pago.',
    uso: 'Informes ejecutivos, EDPs, contratos y todo lo que se imprime o se firma.',
    swatches: { dark: ['#12100C', '#1B1813', '#D08A3C', '#39B37A', '#E5442F'], light: ['#F5F2EB', '#FCFBF7', '#AD5A1F', '#22694A', '#B33322'] },
    tokens: {
      dark: {
        background: '38 14% 5%', foreground: '40 20% 94%',
        primary: '32 68% 54%', 'primary-foreground': '35 45% 8%',
        muted: '38 12% 12%', 'muted-foreground': '38 12% 70%',
        'surface-0': '38 14% 5%', 'surface-1': '38 14% 8%', 'surface-2': '38 12% 13%',
        hairline: '38 12% 20%', info: '32 68% 58%', ...SEMAFORO_DARK,
      },
      light: {
        background: '40 24% 96%', foreground: '25 18% 13%',
        primary: '24 72% 34%', 'primary-foreground': '0 0% 100%',
        muted: '38 16% 91%', 'muted-foreground': '28 12% 34%',
        'surface-0': '40 24% 96%', 'surface-1': '40 30% 99%', 'surface-2': '38 18% 92%',
        hairline: '36 14% 82%', info: '24 72% 36%', ...SEMAFORO_LIGHT,
      },
    },
  },
];

export const TEMA_POR_DEFECTO = 'faena_nocturna';
export const MODO_POR_DEFECTO = 'dark';

export function buscarTema(id) {
  return TEMAS.find(t => t.id === id) || TEMAS[0];
}

// Deriva el set COMPLETO de tokens del sistema desde los tokens base de la
// variante. Así cada paleta define solo lo esencial y el resto queda coherente.
export function tokensCompletos(tema, modo) {
  const t = tema.tokens[modo] || tema.tokens.dark;
  return {
    background: t.background,
    foreground: t.foreground,
    card: t['surface-1'],
    'card-foreground': t.foreground,
    popover: t['surface-1'],
    'popover-foreground': t.foreground,
    primary: t.primary,
    'primary-foreground': t['primary-foreground'],
    secondary: t['surface-2'],
    'secondary-foreground': t.foreground,
    muted: t.muted,
    'muted-foreground': t['muted-foreground'],
    accent: t['surface-2'],
    'accent-foreground': t.foreground,
    destructive: t.danger,
    'destructive-foreground': '0 0% 100%',
    border: t.hairline,
    input: t['surface-2'],
    ring: t.primary,
    'surface-0': t['surface-0'],
    'surface-1': t['surface-1'],
    'surface-2': t['surface-2'],
    hairline: t.hairline,
    ok: t.ok,
    warn: t.warn,
    danger: t.danger,
    info: t.info,
    'sidebar-background': t['surface-1'],
    'sidebar-foreground': t.foreground,
    'sidebar-primary': t.primary,
    'sidebar-primary-foreground': t['primary-foreground'],
    'sidebar-accent': t['surface-2'],
    'sidebar-accent-foreground': t.foreground,
    'sidebar-border': t.hairline,
    'sidebar-ring': t.primary,
  };
}