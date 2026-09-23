import ConversationPanel from '@/components/agent/ConversationPanel';
import { useLocation } from 'react-router-dom';

export default function AsistenteOrion() {
  const { search } = useLocation();
  const incorporacion = new URLSearchParams(search).get('modo') === 'avanzar';
  return (
    <div className="go-control-page h-full overflow-hidden">
      <ConversationPanel key={incorporacion ? 'incorporacion' : 'tecnica'} agentName={incorporacion ? 'go_incorporacion' : 'orion_asistente'} />
    </div>
  );
}