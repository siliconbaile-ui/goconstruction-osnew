import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { safeReturnTo } from '@/lib/authReturnTo';
import RegisterLayout from '@/components/auth/RegisterLayout';
import RegisterCredentials from '@/components/auth/RegisterCredentials';
import RegisterProfile from '@/components/auth/RegisterProfile';
import RegisterAccessOptions from '@/components/auth/RegisterAccessOptions';
import RegisterVerification from '@/components/auth/RegisterVerification';

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [step, setStep] = useState(0);
  const [resending, setResending] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Sin returnTo explícito, el registro termina directo en el asistente.
  const destino = () => { const r = safeReturnTo(); return r === "/" ? "/app" : r; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (step === 0) { setStep(1); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (!result?.access_token) {
        setError("No se pudo confirmar la sesión. Revisa el código e inténtalo nuevamente.");
        return;
      }
      base44.auth.setToken(result.access_token);
      await base44.auth.updateMe({
        nombre_contacto: nombre.trim(),
        telefono: telefono.trim(),
        cargo,
        empresa_nombre: empresa.trim(),
      });
      sessionStorage.setItem('go-just-registered', '1');
      window.location.href = destino();
    } catch (err) {
      setError(err.message || "Código de verificación inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Código enviado",
        description: "Revisa tu correo: ahí está el código nuevo.",
      });
    } catch (err) {
      setError(err.message || "No se pudo reenviar el código");
    } finally {
      setResending(false);
    }
  };

  const handleMicrosoft = async () => {
    setError("");
    setMicrosoftLoading(true);
    try {
      await base44.auth.loginWithProvider("microsoft", destino());
    } catch (err) {
      setError(err.message || "No se pudo continuar con Microsoft. Inténtalo de nuevo.");
      setMicrosoftLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await base44.auth.loginWithProvider("google", destino());
    } catch (err) {
      setError(err.message || "No se pudo continuar con Google. Inténtalo de nuevo.");
      setGoogleLoading(false);
    }
  };

  const currentStep = showOtp ? 2 : step;
  const busy = loading || microsoftLoading || googleLoading;
  return <RegisterLayout step={currentStep}>
    <header className="mb-5" aria-live="polite">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">Paso {currentStep + 1} de 3</p>
      <h1 className="text-2xl font-semibold tracking-tight">{['Crea tu cuenta', 'Cuéntanos de ti', 'Verifica tu correo'][currentStep]}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{['Elige cómo quieres entrar.', 'Tus datos para personalizar la experiencia.', 'Un último paso para entrar a GO.'][currentStep]}</p>
    </header>
    {error && <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    {showOtp ? <RegisterVerification {...{ email, otpCode, setOtpCode, loading, resending, handleVerify, handleResend }} /> : <>
      {step === 0 && <RegisterAccessOptions {...{ handleMicrosoft, handleGoogle, microsoftLoading, googleLoading, loading }} />}
      <form onSubmit={handleSubmit}>
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          {step === 0 ? <RegisterCredentials {...{ email, setEmail, password, setPassword, confirmPassword, setConfirmPassword }} /> : <RegisterProfile {...{ nombre, setNombre, telefono, setTelefono, empresa, setEmpresa, cargo, setCargo }} />}
          <div className="flex gap-3">
            {step === 1 && <Button type="button" variant="outline" className="h-11 gap-2" onClick={() => { setError(''); setStep(0); }}><ArrowLeft className="h-4 w-4" />Atrás</Button>}
            <Button type="submit" className="h-11 flex-1 gap-2" disabled={busy}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creando cuenta…</> : <>{step === 0 ? 'Continuar' : 'Crear cuenta'}<ArrowRight className="h-4 w-4" /></>}</Button>
          </div>
        </fieldset>
      </form>
    </>}
  </RegisterLayout>;
}