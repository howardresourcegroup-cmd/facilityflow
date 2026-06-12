import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { BuildingSetupGuard } from "@/components/buildings/building-setup-guard";
import { WelcomeModal } from "@/components/welcome-modal";
import { TrialBanner } from "@/components/billing/trial-banner";
import { DemoCleanup } from "@/components/demo-cleanup";
import { ProductTour } from "@/components/product-tour";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard>
      <WelcomeModal />
      <DemoCleanup />
      <ProductTour />
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar />
        {/* Mobile slide-out drawer */}
        <MobileSidebar />

        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TrialBanner />
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="page-enter p-4 md:p-6 max-w-[1600px] mx-auto h-full">
              <BuildingSetupGuard>{children}</BuildingSetupGuard>
            </div>
          </main>
        </div>
      </div>
    </OnboardingGuard>
  );
}
