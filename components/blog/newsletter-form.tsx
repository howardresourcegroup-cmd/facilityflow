"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Email capture for the public blog — writes to newsletter_signups (RLS:
// insert-only for the anon key, the list is never readable via the API).
export function NewsletterForm({ source = "blog" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== "idle") return;
    setState("sending");
    setError("");
    const { error: err } = await createClient().from("newsletter_signups").insert({ email: email.trim().toLowerCase(), source });
    if (err && !err.message.includes("duplicate")) {
      setError("That didn't work — double-check the email and try again.");
      setState("idle");
      return;
    }
    setState("done"); // duplicates count as success — they're already on the list
  };

  if (state === "done") {
    return (
      <div className="glass-card p-5 flex items-center gap-3 border-emerald-500/20">
        <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Check className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">You&apos;re on the list.</p>
          <p className="text-xs text-zinc-500">Practical hotel-ops tips, about once a month. No spam, ever.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 border-indigo-500/15">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="h-4 w-4 text-indigo-400" />
        <p className="text-sm font-semibold text-zinc-100">Get hotel-ops tips in your inbox</p>
      </div>
      <p className="text-xs text-zinc-500 mb-3">Maintenance checklists, housekeeping playbooks, and cost-cutting tactics — about once a month.</p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@property.com"
          className="flex-1 h-9 rounded-lg bg-white/[0.04] border border-white/[0.1] px-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-indigo-500/50"
        />
        <button type="submit" disabled={state === "sending"} className="btn-primary h-9 px-4 text-sm shrink-0">
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </button>
      </form>
      {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}
    </div>
  );
}
