import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2 } from 'lucide-react';

export default function RegisterVerification({ email, otpCode, setOtpCode, loading, resending, handleVerify, handleResend }) {
  return <form onSubmit={e => { e.preventDefault(); handleVerify(); }} className="space-y-5">
    <p className="break-words text-sm text-muted-foreground">Escribe el código enviado a <strong className="font-medium text-foreground">{email}</strong>.</p>
    <div className="flex justify-center"><InputOTP aria-label="Código de verificación de seis dígitos" maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code"><InputOTPGroup>{[0, 1, 2, 3, 4, 5].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup></InputOTP></div>
    <Button type="submit" className="h-11 w-full gap-2" disabled={loading || otpCode.length < 6}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? 'Verificando…' : 'Verificar y entrar'}</Button>
    <p className="text-center text-sm text-muted-foreground">¿No llegó? <button type="button" onClick={handleResend} disabled={loading || resending} className="inline-flex min-h-11 items-center font-medium text-primary hover:underline disabled:opacity-50">{resending ? 'Enviando…' : 'Reenviar código'}</button></p>
  </form>;
}