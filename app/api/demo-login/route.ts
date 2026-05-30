export const runtime = "edge";

import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/lib/demo-auth";

export async function GET() {
  const session = JSON.stringify({ name: "Sarah Mitchell", role: "manager", org: "Amicalola Falls State Park & Lodge" });
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  res.cookies.set(DEMO_SESSION_COOKIE, session, { path: "/", maxAge: 86400, httpOnly: false });
  return res;
}
