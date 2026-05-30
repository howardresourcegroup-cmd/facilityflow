// Demo authentication — no Supabase required
// Used for pitches, demos, and trial accounts

export const DEMO_USERS = [
  {
    email: "manager@amicalolafalls.com",
    password: "FacilityFlow2025",
    name: "Sarah Mitchell",
    role: "manager" as const,
    org: "Amicalola Falls State Park & Lodge",
  },
  {
    email: "demo@facilityflow.app",
    password: "demo",
    name: "Demo User",
    role: "admin" as const,
    org: "Demo Organization",
  },
];

export const DEMO_SESSION_COOKIE = "ff-demo-session";

export function getDemoUser(email: string, password: string) {
  return DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) ?? null;
}

export function isDemoMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")
  );
}
