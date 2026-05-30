// Client-safe constants only — NO credentials here.
// Credentials live server-side in /app/api/auth/login/route.ts
// and are read from environment variables.

export const SESSION_COOKIE_LEGACY = "ff-demo-session"; // kept for migration

export function isDemoMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")
  );
}
