// Unified server-side auth check for API routes (edge-compatible).
// Works in both modes:
//   • Supabase mode  → validates the Supabase session from cookies
//   • Demo mode      → validates the signed demo session cookie
// Returns a minimal identity object, or null if unauthenticated.

import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession } from "./session";

export interface AuthedUser {
  id: string;
  name?: string;
}

function supabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")
  );
}

export async function getAuthedUser(req: NextRequest): Promise<AuthedUser | null> {
  // ── Supabase mode ──────────────────────────────────────────────────────────
  if (supabaseConfigured()) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll() { /* no-op: API routes don't refresh the session */ },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user ? { id: user.id } : null;
  }

  // ── Demo mode ──────────────────────────────────────────────────────────────
  const cookie = req.cookies.get(SESSION_COOKIE);
  const session = cookie ? decodeSession(cookie.value) : null;
  return session ? { id: session.userId, name: session.name } : null;
}
