import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const PREFIX = '[GO_MODULO]\n';
const DIVIDER = '\n[CONSULTA]\n';
export const visibleGoMessage = message => message.role === 'user' && message.content?.startsWith(PREFIX)
  ? { ...message, content: message.content.split(DIVIDER).slice(1).join(DIVIDER) }
  : message;

export default function useGoModuleChat(area, snapshot) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    base44.agents.listConversations({ agent_name: 'orion_asistente' }).then(list => {
      const found = (list || []).find(c => c.metadata?.modulo === area);
      if (alive && found) setConversation(found);
    }).catch(() => { if (alive) setError('No se pudo cargar la conversación.'); });
    return () => { alive = false; };
  }, [area]);
  useEffect(() => {
    if (!conversation?.id) return;
    let alive = true;
    base44.agents.getConversation(conversation.id).then(c => { if (alive) setMessages(c.messages || []); })
      .catch(() => { if (alive) setError('No se pudo cargar la conversación.'); });
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, data => {
      if (alive && Array.isArray(data?.messages)) setMessages(data.messages);
    });
    return () => { alive = false; unsubscribe(); };
  }, [conversation?.id]);
  const send = async text => {
    if (!text?.trim() || busy) return false;
    setBusy(true); setError('');
    try {
      const conv = conversation || await base44.agents.createConversation({
        agent_name: 'orion_asistente', metadata: { name: `GO · ${area}`, canal: 'app', modulo: area }
      });
      if (!conversation) setConversation(conv);
      await base44.agents.addMessage(conv, { role: 'user', content: `${PREFIX}Sección ${area}. Registros visibles (muestra limitada; verificar antes de decidir): ${snapshot}\nNo ejecutes cambios sin confirmación humana.${DIVIDER}${text.trim()}` });
      return true;
    } catch {
      setError('No se pudo enviar. Inténtalo nuevamente.');
      return false;
    } finally { setBusy(false); }
  };
  return { messages, conversation, busy, error, send };
}