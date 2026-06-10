export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: "Not configured" }, { status: 501 });

  const caller = createServerClient(url, anon, {
    cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await caller.from("profiles").select("organization_id").eq("id", user.id).single();
  const { data: myPerms } = await caller.rpc("my_permissions");
  const perms: string[] = (myPerms ?? []).map((r: unknown) => typeof r === "string" ? r : (r as { my_permissions: string }).my_permissions);
  if (!me?.organization_id || !perms.includes("team.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json().catch(() => ({}));
  if (!userId || userId === user.id) return NextResponse.json({ error: "Invalid user" }, { status: 400 });

  // Verify target is in the same org
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: target } = await admin.from("profiles").select("organization_id").eq("id", userId).single();
  if (target?.organization_id !== me.organization_id) {
    return NextResponse.json({ error: "User not in your organization" }, { status: 403 });
  }

  // Remove from org (nullify org link, don't delete the auth user)
  await admin.from("profiles").update({ organization_id: null, role: "viewer", role_id: null }).eq("id", userId);

  return NextResponse.json({ ok: true });
}
