export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { createOrGetCustomer, createIncompleteSubscription, stripeConfigured, fetchPrice } from "@/lib/server/stripe";

// The prices we advertise on the landing page, in cents. The Stripe price the
// app is about to charge MUST match one of these — otherwise we refuse rather
// than silently bill a customer a different amount than they were shown.
const EXPECTED_AMOUNTS = { standard: 14900, large: 24900 } as const;

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
    // Auto-tier: 25+ users → Pro ($249), otherwise Standard ($149).
    const { count } = await admin.from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", me.organization_id);
    const userCount = count ?? 0;
    const isLarge = userCount > 25 && !!process.env.STRIPE_PRICE_ID_LARGE;
    const tier: keyof typeof EXPECTED_AMOUNTS = isLarge ? "large" : "standard";
    const priceId = isLarge ? process.env.STRIPE_PRICE_ID_LARGE! : process.env.STRIPE_PRICE_ID!;

    // Guard: confirm the Stripe price matches what we advertise before charging.
    // Catches misconfigured price IDs (e.g. pointing at a $299 object) instead of
    // silently billing the customer more than the UI showed them.
    const price = await fetchPrice(priceId);
    const expected = EXPECTED_AMOUNTS[tier];
    if (price.unitAmount !== expected || price.currency !== "usd" || price.interval !== "month") {
      return NextResponse.json({
        error: "Billing is temporarily unavailable. Our team has been notified.",
        // Logged server-side for us; not a customer-facing detail.
        _detail: `Price mismatch for ${tier}: Stripe ${price.unitAmount} ${price.currency}/${price.interval}, expected ${expected} usd/month`,
      }, { status: 503 });
    }

    const customerId = await createOrGetCustomer(user.email ?? "", me.organization_id, org?.stripe_customer_id);
    const { subscriptionId, clientSecret } = await createIncompleteSubscription(customerId, me.organization_id, priceId);

    await admin.from("organizations").update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    }).eq("id", me.organization_id);

    return NextResponse.json({
      clientSecret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      tier,
      // Use the real Stripe amount (in dollars) so the UI can never show a
      // different number than what's actually charged.
      amount: price.unitAmount / 100,
      userCount,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Subscription failed" }, { status: 500 });
  }
}
