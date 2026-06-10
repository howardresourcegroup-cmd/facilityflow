"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", org: "" });
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]                 = useState("");
  const [confirmSent, setConfirmSent]     = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleGoogle = async () => {
    if (!SUPABASE_CONFIGURED) return;
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // Browser redirects away — OnboardingGuard will prompt for org name if needed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.org.trim()) { setError("Organization name is required"); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, pending_org: form.org.trim() } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!signUpData.session) {
      setConfirmSent(true);
      setLoading(false);
      return;
    }

    const { error: onboardError } = await supabase.rpc("onboard_organization", {
      org_name: form.org.trim(),
      full_name: form.name.trim(),
    });

    if (onboardError) {
      setError(`Account created, but workspace setup failed: ${onboardError.message}`);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  if (confirmSent) {
    return (
      <div className="glass-card p-7 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Check your email</h1>
        <p className="text-sm text-zinc-500 mt-2">
          We sent a confirmation link to <span className="text-zinc-300">{form.email}</span>.
          Click it to activate your account — your workspace will be set up automatically.
        </p>
        <Link href="/login" className="inline-block mt-5 text-sm text-indigo-400 hover:text-indigo-300">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-7">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Start your free trial</h1>
        <p className="text-sm text-zinc-500 mt-1">14 days free · no credit card required.</p>
      </div>

      {/* Google OAuth — appears above the form */}
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
          <p className="mt-2 text-[11px] text-center text-zinc-600">
            New Google users will be prompted to name their workspace.
          </p>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#10101f] px-3 text-xs text-zinc-600">or sign up with email</span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Rachel Kim" value={form.name} onChange={set("name")} required autoComplete="name" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="org">Organization Name</Label>
          <Input id="org" placeholder="Westfield Property Group" value={form.org} onChange={set("org")} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Work Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required autoComplete="email" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} required minLength={8} autoComplete="new-password" />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Start Free Trial"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
      </p>

      <p className="mt-4 text-center text-[11px] text-zinc-600">
        By signing up you agree to our{" "}
        <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );
}
