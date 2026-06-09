export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });

  // 1. Expire the demo-mode session cookie
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });

  // 2. Clear the Supabase auth cookies (production) — this is the part that was missing.
  //    Without it the sb-* session survived and the middleware bounced the user back in.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon && !url.includes("your-project-id")) {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2])
          ),
      },
    });
    await supabase.auth.signOut().catch(() => {});
  }

  return res;
}
