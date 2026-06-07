// Edge-native Stripe helpers — direct REST calls + Web Crypto webhook verification.
// No SDK dependency, works on Cloudflare's edge runtime.
// Activates when STRIPE_SECRET_KEY / STRIPE_PRICE_ID / STRIPE_WEBHOOK_SECRET are set.

const STRIPE_API = "https://api.stripe.com/v1";

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID;
}

function form(params: Record<string, string>): string {
  return Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

// Create a subscription Checkout Session and return its hosted URL.
export async function createCheckoutSession(opts: {
  orgId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form({
      mode: "subscription",
      "line_items[0][price]": process.env.STRIPE_PRICE_ID!,
      "line_items[0][quantity]": "1",
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      customer_email: opts.email,
      client_reference_id: opts.orgId,
      "subscription_data[metadata][organization_id]": opts.orgId,
      "metadata[organization_id]": opts.orgId,
      allow_promotion_codes: "true",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Stripe checkout failed");
  return data.url as string;
}

// ─── Embedded subscription (Payment Element) ──────────────────────────────────
// Create-or-reuse a customer, then create an incomplete subscription and return
// the PaymentIntent client_secret so the client can confirm with Payment Element.
export async function createOrGetCustomer(email: string, orgId: string, existingId?: string | null): Promise<string> {
  if (existingId) return existingId;
  const res = await fetch(`${STRIPE_API}/customers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form({ email, "metadata[organization_id]": orgId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Customer create failed");
  return data.id as string;
}

export async function createIncompleteSubscription(customerId: string, orgId: string): Promise<{ subscriptionId: string; clientSecret: string }> {
  const res = await fetch(`${STRIPE_API}/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form({
      customer: customerId,
      "items[0][price]": process.env.STRIPE_PRICE_ID!,
      payment_behavior: "default_incomplete",
      "payment_settings[save_default_payment_method]": "on_subscription",
      "expand[0]": "latest_invoice.payment_intent",
      "metadata[organization_id]": orgId,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Subscription create failed");
  const clientSecret = data.latest_invoice?.payment_intent?.client_secret;
  if (!clientSecret) throw new Error("No client secret returned");
  return { subscriptionId: data.id, clientSecret };
}

// Open the Stripe customer billing portal for an existing customer.
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const res = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form({ customer: customerId, return_url: returnUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Stripe portal failed");
  return data.url as string;
}

// Verify a Stripe webhook signature using Web Crypto (edge-compatible).
export async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const timestamp = parts["t"];
  const expected = parts["v1"];
  if (!timestamp || !expected) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
  const computed = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

  // constant-time-ish compare
  if (computed.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
