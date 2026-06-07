export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { createOrGetCustomer, createIncompleteSubscription, stripeConfigured } from "@/lib/server/stripe";

// Creates an incomplete subscription and returns the PaymentIntent client_secret
// so the client can confirm payment with the embedded Payment Element.
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Billing isn't configured yet." }, { status: 501 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(url, anon, {
    cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single();
  if (!me?.organization_id || (me.role !== "admin" && me.role !== "manager")) {
    return NextResponse.json({ error: "Only an admin or manager can manage billing." }, { status: 403 });
  }

  // Service-role client to read/write the org's stripe ids (bypass RLS safely, server-side)
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: org } = await admin.from("organizations").select("stripe_customer_id, subscription_status").eq("id", me.organization_id).single();

  if (org?.subscription_status === "active") {
    return NextResponse.json({ error: "You already have an active subscription." }, { status: 400 });
  }

  try {
    const customerId = await createOrGetCustomer(user.email ?? "", me.organization_id, org?.stripe_customer_id);
    const { subscriptionId, clientSecret } = await createIncompleteSubscription(customerId, me.organization_id);

    await admin.from("organizations").update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    }).eq("id", me.organization_id);

    return NextResponse.json({
      clientSecret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Subscription failed" }, { status: 500 });
  }
}
