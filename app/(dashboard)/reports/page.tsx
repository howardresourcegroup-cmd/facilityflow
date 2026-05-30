"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Clock, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const MONTHLY_DATA = [
  { month: "Dec", opened: 28, closed: 31, critical: 3 },
  { month: "Jan", opened: 35, closed: 30, critical: 5 },
  { month: "Feb", opened: 22, closed: 28, critical: 2 },
  { month: "Mar", opened: 41, closed: 35, critical: 6 },
  { month: "Apr", opened: 30, closed: 38, critical: 4 },
  { month: "May", opened: 18, closed: 22, critical: 1 },
];

const CATEGORY_DATA = [
  { name: "HVAC",         value: 28, color: "#6366f1" },
  { name: "Housekeeping", value: 45, color: "#06b6d4" },
  { name: "Plumbing",     value: 18, color: "#f59e0b" },
  { name: "Electrical",   value: 12, color: "#8b5cf6" },
  { name: "Grounds",      value: 9,  color: "#10b981" },
  { name: "Other",        value: 15, color: "#52525b" },
];

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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg. Resolution Time", value: "3.8h",   trend: -12, icon: Clock,         color: "text-indigo-400",  bg: "bg-indigo-500/15" },
          { label: "On-Time Completion",   value: "91%",    trend: +5,  icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/15" },
          { label: "Repeat Issues",        value: "4",      trend: -30, icon: TrendingDown,  color: "text-cyan-400",    bg: "bg-cyan-500/15" },
          { label: "Critical This Month",  value: "1",      trend: -80, icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-500/15" },
        ].map(({ label, value, trend, icon: Icon, color, bg }, i) => (
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
            <p className={`text-xs mt-1 flex items-center gap-1 ${trend < 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {Math.abs(trend)}% vs last month
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Work Order Volume</p>
          <p className="text-base font-semibold text-zinc-200 mb-5">Last 6 Months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                <Pie data={CATEGORY_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {CATEGORY_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {CATEGORY_DATA.map((c) => (
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
