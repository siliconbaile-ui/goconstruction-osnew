import { Bell, TrendingUp, FileText, CreditCard, CheckSquare, ArrowUpCircle, RefreshCw } from 'lucide-react';

export const NIVEL_STYLE = {
  critica: { color: '#D35400', bg: 'rgba(211,84,0,0.08)', border: 'rgba(211,84,0,0.35)', label: 'CRÍTICA' },
  advertencia: { color: '#F39C12', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.3)', label: 'ADVERTENCIA' },
  info: { color: '#4A6FA5', bg: 'rgba(74,111,165,0.08)', border: 'rgba(74,111,165,0.3)', label: 'INFO' },
};

export const TIPO_META = {
  desviacion_avance: { icon: TrendingUp, label: 'Desviación de avance' },
  no_conformidad: { icon: CheckSquare, label: 'No conformidad' },
  rdi_vencido: { icon: FileText, label: 'RDI vencido' },
  pago_bloqueado: { icon: CreditCard, label: 'Pago bloqueado' },
  sincronizacion_falla: { icon: RefreshCw, label: 'Falla de sincronización' },
  escalamiento: { icon: ArrowUpCircle, label: 'Escalamiento' },
};

export const ROL_LABEL = {
  jefe_terreno: 'Jefe de Terreno',
  gerencia_media: 'Gerencia Media',
  alta_direccion: 'Alta Dirección',
  administrador: 'Administrador',
};

export const ESTADO_STYLE = {
  activa: { color: '#D35400', label: 'ACTIVA' },
  reconocida: { color: '#F39C12', label: 'RECONOCIDA' },
  resuelta: { color: '#27AE60', label: 'RESUELTA' },
  archivada: { color: '#4A6FA5', label: 'ARCHIVADA' },
};

export const iconoTipo = (tipo) => TIPO_META[tipo]?.icon || Bell;