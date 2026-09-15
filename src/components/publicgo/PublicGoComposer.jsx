import { Link } from 'react-router-dom';
import { Send, Loader2, Paperclip } from 'lucide-react';
import PublicGoDictation from '@/components/publicgo/PublicGoDictation';

export default function PublicGoComposer({ value, onChange, onSend, busy, error }) {
  return (
    <form onSubmit={event => { event.preventDefault(); onSend(); }} className="shrink-0 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {error && <p role="alert" className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error} Puedes volver a presionar Enviar.</p>}
        <div className="rounded-3xl border border-hairline bg-surface px-4 pb-3 pt-4 orion-elevated">
          <label htmlFor="public-go-message" className="sr-only">Tu consulta para GO</label>
          <textarea id="public-go-message" value={value} disabled={busy} onChange={event => onChange(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); onSend(); } }} rows={3} placeholder="Habla o escríbele a GO · analiza la demo o plantea tu consulta técnica" className="w-full resize-none bg-transparent text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60" />
          <div className="mt-2 flex items-center gap-2">
            <PublicGoDictation onText={onChange} disabled={busy} />
            <Link to="/login?returnTo=%2Fapp" title="Inicia sesión para analizar documentos de tu obra" className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-muted-foreground"><Paperclip className="h-4 w-4" /><span className="hidden sm:inline">Documentos de mi obra</span><span className="sr-only sm:hidden">Iniciar sesión para adjuntar documentos</span></Link>
            <button type="submit" disabled={busy || !value.trim()} className="ml-auto flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Enviar</button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">Demostración de solo lectura. Las recomendaciones requieren validación profesional. No pegues información confidencial.</p>
      </div>
    </form>
  );
}