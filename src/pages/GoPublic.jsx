import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import usePublicGo from '@/components/publicgo/usePublicGo';
import PublicGoHeader from '@/components/publicgo/PublicGoHeader';
import PublicGoMessages from '@/components/publicgo/PublicGoMessages';
import PublicGoComposer from '@/components/publicgo/PublicGoComposer';
import PublicGoData from '@/components/publicgo/PublicGoData';

export default function GoPublic() {
  const { isAuthenticated } = useAuth();
  const { messages, busy, error, send, reset } = usePublicGo();
  const [input, setInput] = useState(''), [showData, setShowData] = useState(false);
  const submit = async text => {
    if (busy) return;
    const content = (text ?? input).trim();
    if (!content) return;
    setInput(content);
    if (await send(content)) setInput('');
  };
  const prompt = text => {
    if (window.innerWidth < 1024) setShowData(false);
    submit(text);
  };
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-surface-base font-body text-foreground">
      <PublicGoHeader busy={busy} onReset={() => { reset(); setInput(''); }} showData={showData} onToggleData={() => setShowData(value => !value)} />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PublicGoMessages messages={messages} busy={busy} onPrompt={prompt} />
          <PublicGoComposer value={input} onChange={setInput} onSend={() => submit()} busy={busy} error={error} />
        </main>
        {showData && <PublicGoData onClose={() => setShowData(false)} onPrompt={prompt} busy={busy} />}
      </div>
    </div>
  );
}