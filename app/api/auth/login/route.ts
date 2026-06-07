export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE, sessionCookieOptions,
  encodeSession, checkRateLimit, resetRateLimit,
} from "@/lib/server/session";

// ─── Credentials live in env vars — NEVER in the client bundle ────────────────
// Set these as secrets in Cloudflare Pages dashboard:
//   DEMO_EMAIL    = manager@grandviewdemo.com
//   DEMO_PASSWORD = (set a strong password, not Roomward2025 in production)
//
// Multiple users: DEMO_USER_2_EMAIL / DEMO_USER_2_PASSWORD etc.
// When Supabase is configured, this entire route is bypassed in favour of
// supabase.auth.signInWithPassword() in the Supabase auth flow.

function getCredentials() {
  const users = [
    {
      email:    (process.env.DEMO_EMAIL    ?? "manager@grandviewdemo.com").toLowerCase(),
      password: process.env.DEMO_PASSWORD  ?? "RoomwardDemo2026",
      name:     process.env.DEMO_NAME      ?? "Sarah Mitchell",
      role:     "manager",
      org:      process.env.DEMO_ORG       ?? "Grandview Resort & Lodge",
      orgId:    "org-amicolola",
    },
    // Additional demo users can be added via env vars
  ];
  return users;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip")
          ?? req.headers.get("x-forwarded-for")?.split(",")[0]
          ?? "unknown";

  // Rate limit check
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email    = (body.email    ?? "").toLowerCase().trim();
  const password = (body.password ?? "").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const users = getCredentials();
  const user  = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    // Don't reveal whether the email exists
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Successful auth — clear rate limit for this IP
  resetRateLimit(ip);

  const session = encodeSession({
    userId: `demo-${user.email}`,
    name:   user.name,
    role:   user.role,
    org:    user.org,
    orgId:  user.orgId,
    iat:    Date.now(),
  });

  const res = NextResponse.json({ ok: true, name: user.name, role: user.role, org: user.org });
  res.cookies.set(SESSION_COOKIE, session, sessionCookieOptions());
  return res;
}
