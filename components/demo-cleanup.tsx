"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// For anonymous demo sessions: tear the sandbox down when the tab is closed or
// hidden. Best-effort (browsers can drop unload work) — the hourly pg_cron sweep
// is the guaranteed backstop. Does nothing for real, signed-in accounts.
export function DemoCleanup() {
  useEffect(() => {
    let isDemo = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      isDemo = !!data.user?.is_anonymous;
    });

    // Only on real unload (close tab / navigate away / refresh) — NOT on tab
    // switch, so peeking at another tab doesn't destroy the sandbox.
    const teardown = (e: PageTransitionEvent) => {
      if (e.persisted) return; // going into bfcache; page may be restored
      if (isDemo && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/demo/end");
        isDemo = false;
      }
    };

    window.addEventListener("pagehide", teardown);
    return () => window.removeEventListener("pagehide", teardown);
  }, []);

  return null;
}
