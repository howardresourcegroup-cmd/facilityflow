export const runtime = "edge";

// One-click demo login — ONLY available when DEMO_MODE=true env var is set.
// Disable this in production by not setting that env var.

import { NextResponse } from "next/server";
import {
  SESSION_COOKIE, sessionCookieOptions, encodeSession,
} from "@/lib/server/session";

export async function GET() {
  if (process.env.DEMO_MODE !== "true") {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = encodeSession({
    userId: "demo-manager",
    name:   process.env.DEMO_NAME  ?? "Sarah Mitchell",
    role:   "manager",
    org:    process.env.DEMO_ORG   ?? "Amicalola Falls State Park & Lodge",
    orgId:  "org-amicolola",
    iat:    Date.now(),
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = NextResponse.redirect(new URL("/", appUrl));
  res.cookies.set(SESSION_COOKIE, session, sessionCookieOptions());
  return res;
}
