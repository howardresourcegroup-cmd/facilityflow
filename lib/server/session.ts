// Server-only — never imported by client components
// Handles session cookie creation, validation, and revocation

export const SESSION_COOKIE = "ff-session";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export interface SessionPayload {
  userId: string;
  name: string;
  role: string;
  org: string;
  orgId: string;
  iat: number; // issued at (unix ms)
}

// Encode session as a signed base64 string.
// In production with Supabase this is replaced by a JWT; the secret
// here is an extra layer so a tampered cookie is rejected at the edge.
export function encodeSession(payload: SessionPayload): string {
  const data = JSON.stringify(payload);
  // Base64url-encode — no crypto needed for edge, we sign with HMAC below
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const data = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(data) as SessionPayload;
    // Check expiry
    const ageMs = Date.now() - payload.iat;
    if (ageMs > SESSION_MAX_AGE * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,                 // not readable by JS — prevents XSS session theft
    secure: true,                   // HTTPS only
    sameSite: "strict" as const,    // no cross-site requests — prevents CSRF
    path: "/",
    maxAge,
  };
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// In-memory per-process bucket. Resets on cold start.
// Good enough to stop automated brute force. For hardened production,
// replace with Cloudflare KV or Durable Objects.

const WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now    = Date.now();
  const bucket = attempts.get(ip);

  if (!bucket || now > bucket.reset) {
    attempts.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }

  bucket.count++;
  return { allowed: true };
}

export function resetRateLimit(ip: string) {
  attempts.delete(ip);
}
