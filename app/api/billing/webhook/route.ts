export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyStripeSignature } from "@/lib/server/stripe";

// Stripe webhook → keeps organization.subscription_status in sync.
// Set the endpoint to /api/billing/webhook in the Stripe dashboard and put the
// signing secret in STRIPE_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!secret || !sig || !(await verifyStripeSignature(payload, sig, secret))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const setStatus = async (orgId: string, status: string, extra: Record<string, unknown> = {}) => {
    if (!orgId) return;
    await admin.from("organizations").update({ subscription_status: status, ...extra }).eq("id", orgId);
  };

  const obj = event.data?.object ?? {};
  const orgId = obj.metadata?.organization_id;

  switch (event.type) {
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      // Subscription is paid → active. Resolve org via customer if needed.
      const customer = obj.customer;
      if (orgId) await setStatus(orgId, "active");
      else if (customer) {
        const { data } = await admin.from("organizations").select("id").eq("stripe_customer_id", customer).single();
        if (data) await setStatus(data.id, "active");
      }
      break;
    }
    case "customer.subscription.updated": {
      const status = obj.status === "active" || obj.status === "trialing" ? "active"
        : obj.status === "past_due" ? "past_due"
        : obj.status === "canceled" ? "canceled" : "trial";
      if (orgId) await setStatus(orgId, status);
      break;
    }
    case "customer.subscription.deleted": {
      if (orgId) await setStatus(orgId, "canceled");
      break;
    }
  }

  return NextResponse.json({ received: true });
}
