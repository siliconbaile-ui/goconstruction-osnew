import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, UserPlus } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import MicrosoftMark from "@/components/MicrosoftMark";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();
  // Sin returnTo explícito se entra directo a operar, sin pasar por la portada.
  const destino = returnTo === "/" ? "/app" : returnTo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = destino;
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoft = async () => {
    setError("");
    setMicrosoftLoading(true);
    try {
      await base44.auth.loginWithProvider("microsoft", destino);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión con Microsoft. Inténtalo de nuevo.");
      setMicrosoftLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await base44.auth.loginWithProvider("google", destino);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Ingresa a la demo de GO"
      subtitle="Crea tu acceso o continúa con tu cuenta Microsoft o Google. Entrarás directamente al agente GO."
      footer={<>¿Ya tienes una cuenta por correo? Ingresa tus datos arriba.</>}
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleMicrosoft}
        disabled={microsoftLoading || loading}
      >
        {microsoftLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Conectando con Microsoft...</> : <><MicrosoftMark className="mr-2 h-4 w-4" />Continuar con Microsoft</>}
      </Button>
      <Button variant="outline" className="mb-3 h-12 w-full text-sm font-medium" onClick={handleGoogle} disabled={googleLoading || microsoftLoading || loading}>
        {googleLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Conectando con Google...</> : <><GoogleIcon className="mr-2 h-5 w-5" />Continuar con Google</>}
      </Button>
      <Button asChild className="mb-6 h-12 w-full text-sm font-semibold">
        <Link to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}><UserPlus className="mr-2 h-4 w-4" />Crear cuenta para la demo</Link>
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">o</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
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
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              ¿La olvidaste?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}