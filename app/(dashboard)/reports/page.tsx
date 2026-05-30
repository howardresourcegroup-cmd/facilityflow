"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Clock, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useWorkOrders } from "@/lib/data/hooks";
import type { WorkOrder } from "@/types";

const CAT_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#52525b"];

// Build last-6-months opened/closed/critical from real work orders
function buildMonthly(orders: WorkOrder[]) {
  const months: { key: string; month: string; opened: number; closed: number; critical: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("en-US", { month: "short" }), opened: 0, closed: 0, critical: 0 });
  }
  const idx = (date: string) => {
    const d = new Date(date);
    return months.findIndex((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
  };
  for (const o of orders) {
    const oi = idx(o.created_at);
    if (oi >= 0) { months[oi].opened++; if (o.priority === "critical") months[oi].critical++; }
    if (o.completed_at) { const ci = idx(o.completed_at); if (ci >= 0) months[ci].closed++; }
  }
  return months;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string; color: string}>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141425] border border-white/[0.08] rounded-xl p-3 shadow-xl text-xs">
      <p className="text-zinc-400 font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-zinc-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-zinc-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { workOrders } = useWorkOrders();

  const { monthly, categories, kpis } = useMemo(() => {
    const monthly = buildMonthly(workOrders);

    // Category breakdown
    const catMap = new Map<string, number>();
    for (const o of workOrders) {
      const c = (o.category || "other").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
      catMap.set(c, (catMap.get(c) ?? 0) + 1);
    }
    const categories = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CAT_COLORS[i % CAT_COLORS.length] }));

    // KPIs
    const completed = workOrders.filter((o) => o.completed_at);
    const resolutionHrs = completed.map((o) => (+new Date(o.completed_at!) - +new Date(o.created_at)) / 3.6e6);
    const avgRes = resolutionHrs.length ? resolutionHrs.reduce((a, b) => a + b, 0) / resolutionHrs.length : 0;
    const now = new Date();
    const criticalThisMonth = workOrders.filter((o) =>
      o.priority === "critical" && new Date(o.created_at).getMonth() === now.getMonth() && new Date(o.created_at).getFullYear() === now.getFullYear()
    ).length;
    const active = workOrders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length;
    const completionRate = workOrders.length ? Math.round((completed.length / workOrders.length) * 100) : 0;

    const kpis = [
      { label: "Avg. Resolution Time", value: avgRes > 0 ? `${avgRes.toFixed(1)}h` : "—", icon: Clock,        color: "text-indigo-400",  bg: "bg-indigo-500/15" },
      { label: "Completion Rate",      value: `${completionRate}%`,                       icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15" },
      { label: "Open Work Orders",     value: String(active),                             icon: TrendingDown, color: "text-cyan-400",    bg: "bg-cyan-500/15" },
      { label: "Critical This Month",  value: String(criticalThisMonth),                  icon: AlertTriangle,color: "text-amber-400",   bg: "bg-amber-500/15" },
    ];

    return { monthly, categories, kpis };
  }, [workOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Reports</h1>
          <p className="text-sm text-zinc-500 mt-1">Operations analytics for Amicalola Falls State Park &amp; Lodge</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* KPIs — computed from real work orders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Work Order Volume</p>
          <p className="text-base font-semibold text-zinc-200 mb-5">Last 6 Months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="opened"  fill="#6366f1" radius={[3,3,0,0]} />
              <Bar dataKey="closed"  fill="#10b981" radius={[3,3,0,0]} />
              <Bar dataKey="critical"fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Opened</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Closed</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Critical</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">By Category</p>
          <p className="text-base font-semibold text-zinc-200 mb-3">Issue Breakdown</p>
          <div className="flex justify-center">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={categories} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {categories.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {categories.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-400">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </span>
                <span className="text-zinc-300 font-medium">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
