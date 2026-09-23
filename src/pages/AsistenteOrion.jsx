import ConversationPanel from '@/components/agent/ConversationPanel';
import { useLocation } from 'react-router-dom';

export default function AsistenteOrion() {
  const { pathname, search } = useLocation();
  const incorporacion = pathname === '/app' && new URLSearchParams(search).get('modo') === 'avanzar';
  const agentName = incorporacion ? 'go_incorporacion' : pathname === '/app' ? 'go_vendedor' : 'orion_asistente';
  return (
    <div className="go-control-page h-full overflow-hidden">
      <ConversationPanel key={agentName} agentName={agentName} />
    </div>
  );
}