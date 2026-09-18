import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MapPin, Loader2 } from 'lucide-react';
import kapsoClient, { kapsoError } from '@/components/kapso/kapsoClient';

export default function KapsoReplyForm({ phoneId, conversationId, canSend }) {
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const cache = useQueryClient();
  const mutation = useMutation({
    mutationFn: kind => kapsoClient({ action: 'send', phone_id: phoneId, conversation_id: conversationId, kind, text: text.trim() }),
    onMutate: () => setNotice(''),
    onSuccess: (_, kind) => {
      if (kind === 'text') setText('');
      setNotice('Kapso aceptó el envío. Actualiza el historial para consultar la entrega.');
      cache.invalidateQueries({ queryKey: ['kapso', phoneId] });
    },
  });
  return <form onSubmit={e => { e.preventDefault(); mutation.mutate('text'); }} className="space-y-3 border-t pt-4">
    <p className="text-xs text-muted-foreground">{canSend ? 'Respuesta manual · ventana de atención de 24 horas abierta.' : 'No hay una ventana de atención abierta verificada. El contacto debe escribir primero; fuera de 24 horas se requiere una plantilla aprobada.'}</p>
    <label htmlFor="kapso-reply" className="block text-sm font-medium">Mensaje al contacto seleccionado</label>
    <Textarea id="kapso-reply" value={text} onChange={e => setText(e.target.value)} maxLength={4096} disabled={!canSend || mutation.isPending} placeholder="Escribe una respuesta o aviso de obra…" />
    <div className="flex flex-wrap gap-2">
      <Button type="submit" disabled={!canSend || !text.trim() || mutation.isPending}>{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Enviar mensaje</Button>
      <Button type="button" variant="outline" disabled={!canSend || mutation.isPending} onClick={() => mutation.mutate('location')}><MapPin className="mr-2 h-4 w-4" />Pedir ubicación</Button>
    </div>
    {mutation.error && <p role="alert" className="text-sm text-destructive">{kapsoError(mutation.error)}</p>}
    {notice && <p role="status" className="text-sm text-ok">{notice}</p>}
  </form>;
}