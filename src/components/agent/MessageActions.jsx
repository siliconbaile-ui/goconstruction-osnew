import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Volume2, Square, Bookmark, BookmarkCheck, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { reproducirTexto, detenerAudio } from '@/lib/hablarTexto';

// Barra de acciones bajo cada respuesta de GO:
// escuchar la respuesta, guardarla y validarla al ADN (aprendizaje del agente).
export default function MessageActions({ content, conversacionId }) {
  const [hablando, setHablando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [validado, setValidado] = useState(false);
  const [cargando, setCargando] = useState(null);
  // Id del registro ADN de esta respuesta: guardar y validar operan sobre el MISMO
  // registro (validar actualiza, no duplica).
  const [adnId, setAdnId] = useState(null);

  const escuchar = async () => {
    if (hablando) { detenerAudio(); setHablando(false); return; }
    setHablando(true);
    setCargando('voz');
    try {
      await reproducirTexto(content, () => setHablando(false));
    } catch { setHablando(false); }
    finally { setCargando(null); }
  };

  const registrar = async (tipo) => {
    setCargando(tipo);
    try {
      const me = await base44.auth.me().catch(() => null);
      const datos = {
        contenido: content.slice(0, 4000),
        resumen: content.split('\n').find(l => l.trim())?.slice(0, 140) || '',
        conversacion_id: conversacionId || '',
        tipo,
        validado_por: tipo === 'validado' ? (me?.full_name || me?.email || '') : '',
        fecha_validacion: tipo === 'validado' ? new Date().toISOString() : null,
      };

      let id = adnId;
      if (!id) {
        // Reutiliza el registro si esta respuesta ya fue guardada antes (otra sesión).
        const previos = await base44.entities.AprendizajeADN.filter({ contenido: datos.contenido }, '-created_date', 1);
        id = previos[0]?.id || null;
      }

      const registro = id
        ? await base44.entities.AprendizajeADN.update(id, datos)
        : await base44.entities.AprendizajeADN.create(datos);
      setAdnId(registro?.id || id);

      if (tipo === 'validado') { setValidado(true); setGuardado(true); }
      else setGuardado(true);
    } finally {
      setCargando(null);
    }
  };

  const Btn = ({ onClick, activo, icon: Icon, label, busy, color }) => (
    <button onClick={onClick} disabled={!!cargando}
      className={`flex items-center gap-1.5 px-2.5 h-8 rounded-full text-[11px] font-medium transition-colors disabled:opacity-50 ${activo ? 'bg-surface-raised' : 'hover:bg-surface-raised'}`}
      style={{ color: activo ? color : 'hsl(var(--muted-foreground))' }}
      title={label}>
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex items-center gap-1 mt-1.5 ml-1">
      <Btn onClick={escuchar} activo={hablando} busy={cargando === 'voz'}
        icon={hablando ? Square : Volume2} label={hablando ? 'Detener' : 'Escuchar'} color="hsl(var(--primary))" />
      <Btn onClick={() => registrar('guardado')} activo={guardado} busy={cargando === 'guardado'}
        icon={guardado ? BookmarkCheck : Bookmark} label={guardado ? 'Guardado' : 'Guardar'} color="hsl(var(--info))" />
      <Btn onClick={() => registrar('validado')} activo={validado} busy={cargando === 'validado'}
        icon={validado ? Check : ShieldCheck} label={validado ? 'Validado al ADN' : 'Validar al ADN'} color="hsl(var(--ok))" />
    </div>
  );
}