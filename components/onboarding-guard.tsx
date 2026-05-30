"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Safety net for self-serve signup: if a logged-in user has no organization
// yet (e.g. they confirmed their email and signed in on a later visit), this
// completes onboarding — using the org name stashed at signup, or prompting
// for one if it's missing.
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ready" | "needs-org">("checking");
  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("ready"); return; } // not logged in → middleware handles it

      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
      if (profile?.organization_id) { setState("ready"); return; }

      // No org — try to auto-complete from signup metadata
      const pending = (user.user_metadata?.pending_org as string | undefined)?.trim();
      if (pending) {
        const { error: e } = await supabase.rpc("onboard_organization", {
          org_name: pending,
          full_name: (user.user_metadata?.full_name as string) ?? "",
        });
        if (!e) { router.refresh(); setState("ready"); return; }
      }
      setState("needs-org");
    })();
  }, [router]);

  const completeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setSaving(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.rpc("onboard_organization", {
      org_name: orgName.trim(), full_name: "",
    });
    if (err) { setError(err.message); setSaving(false); return; }
    router.refresh();
    setState("ready");
  };

  if (state === "checking") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080811]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
      </div>
    );
  }

  if (state === "needs-org") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080811] px-4">
        <div className="w-full max-w-sm glass-card p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">Name your workspace</h1>
              <p className="text-xs text-zinc-500">One last step to set up your operations center.</p>
            </div>
          </div>
          <form onSubmit={completeSetup} className="space-y-3">
            <Input autoFocus value={orgName} onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Westfield Property Group" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={saving || !orgName.trim()}>
              {saving ? "Setting up…" : "Create Workspace"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
