export const runtime = "edge";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Best-effort teardown for a demo sandbox — called via navigator.sendBeacon on
// tab close. Keyed to the caller's session; end_demo() only deletes the org if
// it's a demo org, so this is a no-op for real accounts. The hourly pg_cron
// sweep is the real guarantee if this beacon never arrives.
export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.rpc("end_demo");
  } catch {
    // ignore — the TTL sweep will clean up
  }
  return new NextResponse(null, { status: 204 });
}
