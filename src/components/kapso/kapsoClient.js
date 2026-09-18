import { base44 } from '@/api/base44Client';

export default async function kapsoClient(payload) {
  const { data } = await base44.functions.invoke('gestionarKapso', payload);
  if (data.error) throw new Error(data.error);
  return data;
}

export function kapsoError(error) {
  return error?.response?.data?.error || error?.message || 'No se pudo completar la operación.';
}