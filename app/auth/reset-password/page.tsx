"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setSaving(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setSaving(false); return; }
    setDone(true);
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080811] px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="mb-8 flex items-center gap-2.5 relative z-10">
        <LogoMark className="h-9 w-9 rounded-xl shadow-lg shadow-indigo-500/30" />
        <span className="text-lg font-bold text-zinc-100">Roomward</span>
      </div>

      <div className="w-full max-w-sm relative z-10 glass-card p-7">
        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-100">Password updated</p>
            <p className="text-xs text-zinc-500 mt-1">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-zinc-100">Set a new password</h1>
              <p className="text-sm text-zinc-500 mt-1">Choose something strong — at least 8 characters.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" minLength={8} required autoComplete="new-password" autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm password</Label>
                <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" minLength={8} required autoComplete="new-password" />
              </div>
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={saving || !password || !confirm}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Updating…</> : "Update Password"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-zinc-600">
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
