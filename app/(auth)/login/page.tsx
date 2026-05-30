"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 429) {
        const retry = res.headers.get("Retry-After");
        setError(`Too many attempts. Try again in ${retry ?? "15"} seconds.`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid credentials");
        setLoading(false);
        return;
      }

      // Cookie is set server-side (httpOnly) — just redirect
      router.push("/");
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("manager@amicalolafalls.com");
    setPassword("FacilityFlow2025");
  };

  return (
    <div className="space-y-4">
      {/* Demo banner */}
      <div
        className="glass-card p-4 border-indigo-500/20 bg-indigo-500/5 cursor-pointer hover:bg-indigo-500/10 transition-colors group"
        onClick={fillDemo}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-300">Live Demo — Amicalola Falls Lodge</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Coral Hospitality · Dawsonville, GA</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Login card */}
      <div className="glass-card p-7">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-semibold text-zinc-100">Sign in</h1>
            <Shield className="h-4 w-4 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">Access your operations center.</p>
        </div>

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
              <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
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
            Get started free
          </Link>
        </p>
      </div>

      <p className="text-center text-[11px] text-zinc-700">
        Works with RoomMaster · Opera · Cloudbeds · Maestro · and more
      </p>
    </div>
  );
}
