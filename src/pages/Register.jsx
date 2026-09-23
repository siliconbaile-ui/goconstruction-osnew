import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Phone, Building2, Briefcase } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import MicrosoftMark from "@/components/MicrosoftMark";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { CARGOS } from "@/lib/cargos";
import WhatsAppConnectLink from '@/components/whatsapp/WhatsAppConnectLink';

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
      window.location.href = destino();
    } catch (err) {
      setError(err.message || "Código de verificación inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Código enviado",
        description: "Revisa tu correo: ahí está el código nuevo.",
      });
    } catch (err) {
      setError(err.message || "No se pudo reenviar el código");
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

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verifica tu correo"
        subtitle={`Enviamos un código a ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          ¿No llegó el código?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Reenviar
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Crea tu cuenta"
      subtitle="Acceso inmediato a la demo después de verificar tu correo"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      {/* WhatsApp · camino principal */}
      <div className="mb-5 rounded-2xl border border-ok/30 bg-ok/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ok/15">
            <svg className="h-5 w-5 text-ok" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Conversa con GO por WhatsApp</p>
            <p className="text-xs text-muted-foreground">Sin cuenta ni contraseña. Pruébalo al instante.</p>
          </div>
        </div>
        <WhatsAppConnectLink className="mt-3 w-full justify-center px-4 py-2.5 text-sm font-medium">
          Iniciar conversación
        </WhatsAppConnectLink>
      </div>

      {/* Social auth · agrupado */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-11 text-sm font-medium" onClick={handleMicrosoft} disabled={microsoftLoading || loading}>
          {microsoftLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MicrosoftMark className="mr-2 h-4 w-4" />}
          <span className="truncate">Microsoft</span>
        </Button>
        <Button variant="outline" className="h-11 text-sm font-medium" onClick={handleGoogle} disabled={googleLoading || microsoftLoading || loading}>
          {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
          <span className="truncate">Google</span>
        </Button>
      </div>

      {/* Separador */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-surface px-3 text-muted-foreground">o crea tu cuenta manualmente</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs">Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="nombre" autoComplete="name" placeholder="Tu nombre y apellido" value={nombre} onChange={(e) => setNombre(e.target.value)} className="pl-9 h-11" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefono" className="text-xs">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="telefono" type="tel" autoComplete="tel" placeholder="+56 9 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="pl-9 h-11" required />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cargo" className="text-xs">Cargo</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <select id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full h-11 rounded-md border border-input bg-transparent pl-9 pr-3 text-sm text-foreground" required>
                <option value="" className="bg-background">Selecciona</option>
                {CARGOS.map((item) => <option key={item.value} value={item.value} className="bg-background">{item.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="empresa" className="text-xs">Empresa</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="empresa" autoComplete="organization" placeholder="Constructora SpA" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="pl-9 h-11" required />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs">Correo</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-11"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-11"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs">Confirmar</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9 h-11"
                required
              />
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full h-11 mt-1 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear mi acceso"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}