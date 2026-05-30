# Security

## Secret scanning

This repo has two layers of protection against committing credentials.

### 1. Local pre-commit hook (blocks before it ever leaves your machine)

A dependency-free hook at [.githooks/pre-commit](.githooks/pre-commit) scans every
staged change for credential patterns (GitHub tokens, Stripe keys, AWS keys, private
keys, JWTs, hardcoded secrets, and `.env` files). If it finds one, the commit is blocked.

**Enable it once per clone:**

```bash
git config core.hooksPath .githooks
```

That's it — it now runs automatically on every `git commit`. To bypass for a genuine
false positive: `git commit --no-verify` (use sparingly).

### 2. GitHub secret scanning (server-side safety net)

Turn on GitHub's built-in scanning as a backstop:

**Repo → Settings → Code security and analysis → Secret scanning → Enable**
(also enable **Push protection**, which rejects a push containing a detected secret).

Free for public repos. If a known secret type is ever pushed, GitHub alerts you and,
for partners like Stripe/AWS, can trigger automatic revocation.

## Secrets belong in environment variables

Never hardcode credentials. All secrets are read from environment variables:

| Variable | Where it's set | Purpose |
|---|---|---|
| `DEMO_PASSWORD` | Cloudflare Pages → Settings → Variables (encrypted) | Demo login password |
| `NEXT_PUBLIC_SUPABASE_URL` | Cloudflare Pages | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cloudflare Pages | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloudflare Pages (encrypted) | Server-only admin key — never exposed to the client |
| `RM_API_TOKEN` | Cloudflare Pages (encrypted) | RoomMaster Agora API token |
| `EPTURA_API_TOKEN` | Cloudflare Pages (encrypted) | Eptura API token |

`NEXT_PUBLIC_*` variables are embedded in the client bundle and are visible to anyone —
only put publishable/anon keys there. Everything else stays server-side.

## Application security measures

- **Sessions**: httpOnly + Secure + SameSite=Strict cookies (not readable by JS, not sent cross-site)
- **Auth**: credentials validated server-side only; never shipped to the client bundle
- **Rate limiting**: login attempts are throttled per IP (5 per 15 min)
- **Security headers**: HSTS, X-Frame-Options DENY, CSP frame-ancestors none, nosniff, Permissions-Policy
- **API routes**: every data endpoint requires a valid session
- **Transport**: HTTPS enforced end-to-end by Cloudflare
- **At rest**: database encryption handled by Supabase (AES-256)

## Reporting

Found a vulnerability? Email security@howardresourcegroup.com — do not open a public issue.
