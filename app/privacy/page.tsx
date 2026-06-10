import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Roomward",
  description: "How Roomward collects, uses, and protects your data.",
};

const LAST_UPDATED = "June 10, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080811] text-zinc-300">
      {/* Nav */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8 rounded-xl" />
            <span className="text-base font-bold text-zinc-100">Roomward</span>
          </Link>
          <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 mt-2">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Who We Are">
          <p>Roomward is a property operations platform developed and operated by <strong className="text-zinc-200">Howard Resource Group LLC</strong>, a limited liability company based in Dawsonville, Georgia. When this policy says "Roomward," "we," "us," or "our," it means Howard Resource Group LLC.</p>
          <p className="mt-3">Contact: <a href="mailto:admin@howardresourcegroup.com" className="text-indigo-400 hover:text-indigo-300">admin@howardresourcegroup.com</a></p>
        </Section>

        <Section title="2. What Data We Collect">
          <p className="font-medium text-zinc-200 mb-2">Account &amp; Identity</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Name and email address (provided at signup or via Google OAuth)</li>
            <li>Organization name and workspace configuration</li>
            <li>Role and permission settings within your organization</li>
          </ul>

          <p className="font-medium text-zinc-200 mt-4 mb-2">Property &amp; Operational Data</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Buildings, floors, and room configurations you create</li>
            <li>Work orders, maintenance records, and housekeeping statuses</li>
            <li>Team messages sent within the platform</li>
            <li>Asset records and maintenance schedules</li>
          </ul>

          <p className="font-medium text-zinc-200 mt-4 mb-2">Usage &amp; Technical Data</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Browser type, device type, and IP address</li>
            <li>Pages visited and features used within the platform</li>
            <li>Error logs for debugging and service improvement</li>
          </ul>

          <p className="font-medium text-zinc-200 mt-4 mb-2">Payment Data</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Subscription status and billing history</li>
            <li>Payment card details are handled entirely by Stripe — we never see or store your card number</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="list-disc list-inside space-y-2 text-zinc-400">
            <li>To provide, operate, and improve the Roomward service</li>
            <li>To authenticate your identity and manage your account</li>
            <li>To send transactional emails (account confirmation, password reset, billing receipts)</li>
            <li>To process subscription payments through Stripe</li>
            <li>To diagnose technical issues and monitor service health</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p className="mt-3">We do not sell your data. We do not use your operational property data for advertising purposes.</p>
        </Section>

        <Section title="4. Data Storage &amp; Security">
          <p>Your data is stored in <strong className="text-zinc-200">Supabase</strong> (PostgreSQL database hosted on AWS infrastructure) and served via <strong className="text-zinc-200">Cloudflare Pages</strong>. Both providers maintain SOC 2 compliance and encrypt data in transit (TLS) and at rest.</p>
          <p className="mt-3">We apply row-level security (RLS) so that data belonging to your organization is only accessible to authenticated members of that organization. No other organization on the platform can access your data.</p>
          <p className="mt-3">While we take reasonable technical precautions, no system is completely immune to security incidents. If a breach affects your data, we will notify you promptly as required by applicable law.</p>
        </Section>

        <Section title="5. Third-Party Services">
          <p>Roomward uses the following third-party services, each with their own privacy policies:</p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 mt-3">
            <li><strong className="text-zinc-300">Supabase</strong> — authentication and database (supabase.com/privacy)</li>
            <li><strong className="text-zinc-300">Cloudflare</strong> — hosting and edge delivery (cloudflare.com/privacypolicy)</li>
            <li><strong className="text-zinc-300">Stripe</strong> — payment processing (stripe.com/privacy)</li>
            <li><strong className="text-zinc-300">Google</strong> — optional OAuth sign-in (policies.google.com/privacy)</li>
          </ul>
          <p className="mt-3">We share only the minimum data necessary with each provider to perform their service.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your account and operational data for as long as your subscription is active. If you cancel, your data is retained for 90 days to allow reactivation, then permanently deleted unless you request earlier deletion.</p>
          <p className="mt-3">To request deletion of your data, email <a href="mailto:admin@howardresourcegroup.com" className="text-indigo-400 hover:text-indigo-300">admin@howardresourcegroup.com</a>.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 mt-3">
            <li>Access a copy of the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability (receive your data in a machine-readable format)</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:admin@howardresourcegroup.com" className="text-indigo-400 hover:text-indigo-300">admin@howardresourcegroup.com</a>.</p>
        </Section>

        <Section title="8. Cookies">
          <p>Roomward uses authentication session cookies to keep you logged in. We do not use advertising cookies or third-party tracking cookies. No consent banner is required for strictly necessary session cookies.</p>
        </Section>

        <Section title="9. Children">
          <p>Roomward is a business tool intended for adults. We do not knowingly collect data from anyone under 16. If you believe a minor has created an account, contact us and we will delete it promptly.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this policy from time to time. We will notify active users by email if changes are material. Continued use of Roomward after changes take effect constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="11. Contact">
          <p>Howard Resource Group LLC<br />Dawsonville, Georgia, USA<br />
            <a href="mailto:admin@howardresourcegroup.com" className="text-indigo-400 hover:text-indigo-300">admin@howardresourcegroup.com</a>
          </p>
        </Section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-600">
        © 2026 Roomward · Howard Resource Group LLC ·{" "}
        <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </section>
  );
}
