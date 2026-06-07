"use client";

import Link from "next/link";
import { format } from "date-fns";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { BuildingHealth } from "@/components/dashboard/building-health";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";
import { RoomMasterPanel, IntegrationsPanel } from "@/components/integrations/roommaster-panel";
import { EpturaPanel } from "@/components/integrations/eptura-panel";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { MaintenanceDashboard, HousekeepingDashboard, FrontDeskDashboard } from "@/components/dashboard/role-dashboards";
import { MOCK_STATS, MOCK_ACTIVITY } from "@/lib/mock-data";
import { useWorkOrders, useDashboardStats, useCurrentProfile, usePermissions } from "@/lib/data/hooks";

export default function DashboardPage() {
  const { workOrders } = useWorkOrders();
  const stats = useDashboardStats();
  const profile = useCurrentProfile();
  const { can } = usePermissions();
  const showIntegrations = can("integrations.manage");
  const now = new Date();

  // Role-tailored home view — each role lands on what matters to them.
  // Managers/admins/viewers (and custom roles) get the full operations dashboard below.
  if (profile?.role_slug === "maintenance") return <MaintenanceDashboard profile={profile} />;
  if (profile?.role_slug === "housekeeping") return <HousekeepingDashboard profile={profile} />;
  if (profile?.role_slug === "front_desk") return <FrontDeskDashboard profile={profile} />;

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const urgentOrders = workOrders
    .filter((w) => w.status !== "completed" && w.status !== "cancelled" &&
      (w.priority === "critical" || w.status === "in_progress"))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {format(now, "EEEE, MMMM d, yyyy")} · Grandview Falls State Park &amp; Lodge
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-zinc-600 uppercase tracking-wider">Local Time</p>
          <p className="text-2xl font-mono font-semibold text-zinc-300 tabular-nums">
            {format(now, "h:mm a")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats ?? MOCK_STATS} />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left */}
        <div className="xl:col-span-2 space-y-5">
          <MetricsChart />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-300">Active &amp; Critical</h2>
              <Link href="/work-orders" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {urgentOrders.map((o, i) => (
                <WorkOrderCard key={o.id} order={o} index={i} />
              ))}
            </div>
          </div>

          {/* Integrations — managers/admins only */}
          {showIntegrations && <RoomMasterPanel />}
          {showIntegrations && <EpturaPanel />}
        </div>

        {/* Right */}
        <div className="space-y-5">
          <GettingStarted />
          <div className="h-[320px]">
            <ActivityFeed items={MOCK_ACTIVITY.slice(0, 6)} />
          </div>
          <BuildingHealth />
          {showIntegrations && <IntegrationsPanel />}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
