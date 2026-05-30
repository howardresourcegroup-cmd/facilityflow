"use client";

import Link from "next/link";
import { format } from "date-fns";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { BuildingHealth } from "@/components/dashboard/building-health";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";
import { RoomMasterPanel, IntegrationsPanel } from "@/components/integrations/roommaster-panel";
import { MOCK_STATS, MOCK_ACTIVITY } from "@/lib/mock-data";
import { useDataStore } from "@/lib/store/data-store";

export default function DashboardPage() {
  const { workOrders } = useDataStore();
  const now = new Date();

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
            {getGreeting()}, Sarah
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {format(now, "EEEE, MMMM d, yyyy")} · Amicalola Falls State Park &amp; Lodge
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
      <StatsGrid stats={MOCK_STATS} />

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

          {/* RoomMaster integration */}
          <RoomMasterPanel />
        </div>

        {/* Right */}
        <div className="space-y-5">
          <div className="h-[320px]">
            <ActivityFeed items={MOCK_ACTIVITY.slice(0, 6)} />
          </div>
          <BuildingHealth />
          <IntegrationsPanel />
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
