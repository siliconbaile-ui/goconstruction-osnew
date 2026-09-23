import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MicrosoftMark from '@/components/MicrosoftMark';
import GoogleIcon from '@/components/GoogleIcon';

export default function RegisterAccessOptions({ handleMicrosoft, handleGoogle, microsoftLoading, googleLoading, loading }) {
  const busy = loading || googleLoading || microsoftLoading;
  return <>
    <div className="grid grid-cols-2 gap-3">
      <Button type="button" variant="outline" className="h-11 gap-2" onClick={handleGoogle} disabled={busy}>{googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}Google</Button>
      <Button type="button" variant="outline" className="h-11 gap-2" onClick={handleMicrosoft} disabled={busy}>{microsoftLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MicrosoftMark className="h-4 w-4" />}Microsoft</Button>
    </div>
    <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o continúa con tu correo<span className="h-px flex-1 bg-border" /></div>
  </>;
}