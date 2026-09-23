import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function usePublicGo(agentName = 'go_vendedor') {
  const [messages, setMessages] = useState([]), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const conversation = useRef(null), unsubscribe = useRef(null), lock = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; unsubscribe.current?.(); }; }, []);
  const receive = data => { if (mounted.current && Array.isArray(data?.messages)) setMessages(data.messages); };
  const send = async text => {
    const content = text.trim();
    if (!content || lock.current) return false;
    lock.current = true; setBusy(true); setError('');
    try {
      if (!conversation.current) {
        const created = await base44.agents.createConversation({ agent_name: agentName, metadata: { name: agentName === 'go_incorporacion' ? 'GO · incorporación' : 'GO · consulta pública de demostración' } });
        if (!mounted.current) return false;
        conversation.current = created;
        unsubscribe.current = base44.agents.subscribeToConversation(created.id, receive);
      }
      const fresh = await base44.agents.getConversation(conversation.current.id);
      if (!mounted.current) return false;
      setMessages([...(fresh.messages || []), { id: 'local-pending', role: 'user', content }]);
      await base44.agents.addMessage(fresh, { role: 'user', content });
      if (mounted.current) receive(await base44.agents.getConversation(fresh.id));
      return true;
    } catch (err) {
      if (mounted.current) {
        setError(err.message || 'No se pudo enviar la consulta. Tu texto sigue disponible para reintentar.');
        setMessages(rows => rows.filter(m => m.id !== 'local-pending'));
      }
      return false;
    } finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  const reset = () => {
    if (lock.current) return;
    unsubscribe.current?.(); unsubscribe.current = null; conversation.current = null;
    setMessages([]); setError('');
  };
  return { messages, busy, error, send, reset };
}