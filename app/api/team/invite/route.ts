export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// Invite a teammate. Uses the service-role key (server-only) to create the
// user and link them to the caller's organization with a chosen role.
// Requires SUPABASE_SERVICE_ROLE_KEY env var (set in Cloudflare for production).

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return NextResponse.json({ error: "Team invites aren't configured (missing service key)." }, { status: 501 });
  }

  // ── Verify the caller ───────────────────────────────────────────────────────
  const caller = createServerClient(url, anon, {
    cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await caller.from("profiles").select("organization_id").eq("id", user.id).single();
  const { data: myPerms } = await caller.rpc("my_permissions");
  const perms: string[] = (myPerms ?? []).map((r: unknown) => typeof r === "string" ? r : (r as { my_permissions: string }).my_permissions);
  if (!me?.organization_id || !perms.includes("team.manage")) {
    return NextResponse.json({ error: "You don't have permission to invite teammates." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = (body.email ?? "").toLowerCase().trim();
  const name  = (body.name ?? "").trim();
  const roleSlug = (body.role ?? "maintenance").trim();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  // ── Create the user with the service-role client ────────────────────────────
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const tempPassword = `Ff-${Math.random().toString(36).slice(2, 10)}!${Math.floor(Math.random() * 90 + 10)}`;
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password: tempPassword, email_confirm: true, user_metadata: { full_name: name },
  });
  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 400 });
  }

  // Resolve the role for this org
  const { data: role } = await admin.from("roles")
    .select("id, slug").eq("organization_id", me.organization_id).eq("slug", roleSlug).single();

  // Link their profile to the org + role (handle_new_user already made the profile)
  await admin.from("profiles").update({
    organization_id: me.organization_id,
    full_name: name || email.split("@")[0],
    role: roleSlug === "manager" || roleSlug === "admin" ? roleSlug : "technician",
    role_id: role?.id ?? null,
  }).eq("id", created.user.id);

  return NextResponse.json({ ok: true, email, temp_password: tempPassword });
}
