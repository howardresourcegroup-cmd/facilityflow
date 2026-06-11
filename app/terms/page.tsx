import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Roomward",
  description: "The terms that govern your use of Roomward.",
};

const LAST_UPDATED = "June 10, 2026";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-zinc-100">Terms of Service</h1>
          <p className="text-sm text-zinc-500 mt-2">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Agreement">
          <p>These Terms of Service (&ldquo;Terms&rdquo;) are a legal agreement between you (or the organization you represent) and <strong className="text-zinc-200">Howard Resource Group LLC</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;Roomward&rdquo;). By creating an account or using Roomward, you agree to these Terms. If you do not agree, do not use the service.</p>
        </Section>

        <Section title="2. The Service">
          <p>Roomward is a cloud-based property operations platform for hotels, lodges, and similar facilities. It provides tools for work order management, housekeeping coordination, team communication, floor plan mapping, and third-party PMS integration.</p>
          <p className="mt-3">We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.</p>
        </Section>

        <Section title="3. Accounts">
          <ul className="list-disc list-inside space-y-2 text-zinc-400">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the security of your login credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>One account may represent one organization. Each organization&apos;s data is isolated from others on the platform.</li>
            <li>You must be at least 18 years old to use Roomward.</li>
          </ul>
        </Section>

        <Section title="4. Subscriptions &amp; Billing">
          <p>Roomward offers a 14-day free trial with no credit card required. After the trial, continued use requires a paid subscription.</p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 mt-3">
            <li>Subscriptions are billed monthly per property.</li>
            <li>Payments are processed by Stripe. By subscribing you also agree to Stripe&apos;s terms.</li>
            <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
            <li>Refunds are handled on a case-by-case basis — contact us within 7 days of a charge if you believe it was made in error.</li>
            <li>We may change pricing with 30 days&apos; notice. Continued use after the notice period constitutes acceptance.</li>
          </ul>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 text-zinc-400 mt-3">
            <li>Use Roomward for any unlawful purpose or in violation of any regulations</li>
            <li>Attempt to gain unauthorized access to other organizations&apos; data</li>
            <li>Reverse engineer, decompile, or extract the source code of the platform</li>
            <li>Use automated tools to scrape or overload our infrastructure</li>
            <li>Resell or sublicense access to the platform without our written consent</li>
            <li>Upload content that is illegal, harmful, or infringes third-party rights</li>
          </ul>
          <p className="mt-3">We may suspend or terminate accounts that violate these rules without prior notice.</p>
        </Section>

        <Section title="6. Your Data">
          <p>You own the data you enter into Roomward. We do not claim ownership of your property records, work orders, or operational data.</p>
          <p className="mt-3">By using the service, you grant us a limited license to store and process your data solely to provide the service to you. We will not sell or share your data with third parties except as described in our <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>.</p>
          <p className="mt-3">You are responsible for ensuring that the data you enter into Roomward complies with applicable laws, including any privacy obligations toward your guests or employees.</p>
        </Section>

        <Section title="7. Integrations">
          <p>Roomward may connect to third-party systems (RoomMaster, Eptura, Opera, etc.) at your direction. We are not responsible for the availability, accuracy, or actions of those third-party systems. Any data shared with integrations is governed by those providers&apos; own terms.</p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>The Roomward platform, logo, and all software are the property of Howard Resource Group LLC. Nothing in these Terms grants you ownership of any platform intellectual property. You may not use our name, logo, or branding without written permission.</p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>To the fullest extent permitted by law, Howard Resource Group LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of Roomward, including but not limited to lost profits, data loss, or service interruptions.</p>
          <p className="mt-3">Our total liability to you for any claim arising from these Terms or the service shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
        </Section>

        <Section title="10. Disclaimers">
          <p>Roomward is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure. We recommend maintaining your own backups of critical operational data.</p>
        </Section>

        <Section title="11. Termination">
          <p>Either party may terminate at any time. You may cancel your subscription through the billing settings or by contacting us. We may terminate or suspend your account for violations of these Terms.</p>
          <p className="mt-3">Upon termination, your data will be retained for 90 days to allow export or reactivation, then permanently deleted.</p>
        </Section>

        <Section title="12. Governing Law">
          <p>These Terms are governed by the laws of the State of Georgia, United States. Any disputes shall be resolved in the courts of Dawson County, Georgia, or through binding arbitration as mutually agreed.</p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>We may update these Terms from time to time. Material changes will be communicated by email to active account holders. Continued use of Roomward after changes take effect constitutes acceptance.</p>
        </Section>

        <Section title="14. Contact">
          <p>Howard Resource Group LLC<br />Dawsonville, Georgia, USA<br />
            <a href="mailto:admin@howardresourcegroup.com" className="text-indigo-400 hover:text-indigo-300">admin@howardresourcegroup.com</a>
          </p>
        </Section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-600">
        © 2026 Roomward · Howard Resource Group LLC ·{" "}
        <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
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
