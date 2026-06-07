import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { WelcomeModal } from "@/components/welcome-modal";
import { TrialBanner } from "@/components/billing/trial-banner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard>
      <WelcomeModal />
      <div className="flex h-screen overflow-hidden bg-[#080811]">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TrialBanner />
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="page-enter p-6 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </OnboardingGuard>
  );
}
