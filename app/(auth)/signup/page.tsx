"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", org: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.org.trim()) { setError("Organization name is required"); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. Create the auth user
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      // Stash org name in metadata so onboarding can complete even after
      // an email-confirmation round-trip (session lost between signup & login)
      options: { data: { full_name: form.name, pending_org: form.org.trim() } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is required, there's no session yet — tell the user.
    if (!signUpData.session) {
      setError("");
      setConfirmSent(true);
      setLoading(false);
      return;
    }

    // 2. Onboard: create org, seed roles, make this user the Administrator
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
          Click it to activate your account, then sign in — your workspace will be set up automatically.
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
        By signing up you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
