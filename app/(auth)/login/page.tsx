"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, Shield, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState("");

  // Forgot-password inline state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent]   = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!SUPABASE_CONFIGURED) {
      setError("Authentication isn't configured. Set the Supabase environment variables.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleGoogle = async () => {
    if (!SUPABASE_CONFIGURED) return;
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // Browser redirects away — no need to setGoogleLoading(false)
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SUPABASE_CONFIGURED) return;
    setResetLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    setResetSent(true);
    setResetLoading(false);
  };

  const [demoLoading, setDemoLoading] = useState(false);
  const startDemo = async () => {
    if (demoLoading) return;
    setDemoLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) throw anonErr;
      const { error: rpcErr } = await supabase.rpc("start_demo");
      if (rpcErr) throw rpcErr;
      // Hard nav so the middleware re-runs with the new session cookies.
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the demo — please try again.");
      setDemoLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <div className="glass-card p-7">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-100">Reset password</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>
        {resetSent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-100">Check your email</p>
            <p className="text-xs text-zinc-500 mt-1">
              We sent a reset link to <span className="text-zinc-300">{resetEmail}</span>.
            </p>
            <button onClick={() => { setForgotMode(false); setResetSent(false); }}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300">
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email</Label>
              <Input id="reset-email" type="email" value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="you@property.com" required autoFocus autoComplete="email" />
            </div>
            <Button type="submit" className="w-full" disabled={resetLoading || !resetEmail}>
              {resetLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : "Send Reset Link"}
            </Button>
            <button type="button" onClick={() => setForgotMode(false)}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 pt-1">
              Back to sign in
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Demo banner — spins up a private throwaway sandbox */}
      <button
        type="button"
        onClick={startDemo}
        disabled={demoLoading}
        className="w-full text-left glass-card p-4 border-indigo-500/20 bg-indigo-500/5 cursor-pointer hover:bg-indigo-500/10 transition-colors group disabled:opacity-70 disabled:cursor-wait"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-300">
                {demoLoading ? "Spinning up your demo…" : "Try the live demo"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                A private sample hotel — no sign-up, nothing to clean up.
              </p>
            </div>
          </div>
          {demoLoading
            ? <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
            : <ArrowRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />}
        </div>
      </button>

      {/* Login card */}
      <div className="glass-card p-7">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-semibold text-zinc-100">Sign in</h1>
            <Shield className="h-4 w-4 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">Access your operations center.</p>
        </div>

        {/* Google OAuth */}
        {SUPABASE_CONFIGURED && (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#10101f] px-3 text-xs text-zinc-600">or sign in with email</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email" type="email"
              placeholder="you@property.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Start a free trial
          </Link>
        </p>
      </div>

      <p className="text-center text-[11px] text-zinc-700">
        Works with RoomMaster · Opera · Cloudbeds · Maestro · and more
      </p>
    </div>
  );
}
