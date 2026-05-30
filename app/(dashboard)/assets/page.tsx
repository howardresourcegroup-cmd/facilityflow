"use client";

import { motion } from "framer-motion";
import { Package, Plus, Wrench, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ASSETS = [
  { id: "a1",  name: "HVAC Unit 1 — Rooftop",      type: "HVAC",       location: "Mechanical Room",   status: "operational",  model: "Carrier 50XC060",     serial: "CC2310-0441", last_service: "2026-02-14", next_service: "2026-08-14" },
  { id: "a2",  name: "HVAC Unit 2 — Rooftop",      type: "HVAC",       location: "Mechanical Room",   status: "maintenance",  model: "Carrier 50XC060",     serial: "CC2310-0442", last_service: "2025-12-01", next_service: "2026-06-01" },
  { id: "a3",  name: "Commercial Dishwasher",       type: "Kitchen",    location: "Maple St. Grille",  status: "operational",  model: "Hobart AM15",         serial: "HB-98234",    last_service: "2026-03-10", next_service: "2026-09-10" },
  { id: "a4",  name: "Pool Pump — Main",            type: "Pool",       location: "Outdoor Pool",      status: "operational",  model: "Pentair IntelliFlo",  serial: "PF-00123",    last_service: "2026-04-01", next_service: "2026-10-01" },
  { id: "a5",  name: "Emergency Generator",         type: "Electrical", location: "Generator Room",    status: "operational",  model: "Generac QT150",       serial: "GN-7712",     last_service: "2026-01-15", next_service: "2026-07-15" },
  { id: "a6",  name: "Elevator — Unit 1",           type: "Elevator",   location: "Elevator Bank",     status: "operational",  model: "Otis Gen2",           serial: "OT-00451",    last_service: "2026-02-28", next_service: "2026-08-28" },
  { id: "a7",  name: "Ice Machine — Floor 2",       type: "Kitchen",    location: "Floor 2 Vending",   status: "operational",  model: "Manitowoc UDF0140A",  serial: "MT-33291",    last_service: "2026-03-20", next_service: "2026-09-20" },
  { id: "a8",  name: "Boiler — Domestic Hot Water", type: "Plumbing",   location: "Mechanical Room",   status: "degraded",     model: "Lochinvar Knight 85", serial: "LK-10034",    last_service: "2025-11-05", next_service: "2026-05-05" },
  { id: "a9",  name: "Security System — Lodge",     type: "Security",   location: "Front Desk",        status: "operational",  model: "Bosch B5512",         serial: "BS-22914",    last_service: "2026-01-10", next_service: "2026-07-10" },
  { id: "a10", name: "Laundry Washer x3",           type: "Laundry",    location: "Laundry",           status: "operational",  model: "Maytag MHN33PD",      serial: "MW-3x-001",   last_service: "2026-02-01", next_service: "2026-08-01" },
];

const STATUS_STYLES = {
  operational: { label: "Operational", variant: "success"  as const },
  maintenance:  { label: "In Maintenance", variant: "warning" as const },
  degraded:     { label: "Degraded",  variant: "warning" as const },
  failed:       { label: "Failed",    variant: "danger"   as const },
};

export default function AssetsPage() {
  const counts = {
    total:       ASSETS.length,
    operational: ASSETS.filter((a) => a.status === "operational").length,
    attention:   ASSETS.filter((a) => a.status !== "operational").length,
    overdue:     ASSETS.filter((a) => new Date(a.next_service) < new Date()).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Assets</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {counts.total} tracked · {counts.operational} operational
            {counts.attention > 0 && <span className="text-amber-400"> · {counts.attention} need attention</span>}
            {counts.overdue > 0 && <span className="text-red-400"> · {counts.overdue} service overdue</span>}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assets",   value: counts.total,       icon: Package,       color: "text-indigo-400",  bg: "bg-indigo-500/15" },
          { label: "Operational",    value: counts.operational, icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/15" },
          { label: "Need Attention", value: counts.attention,   icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-500/15" },
          { label: "Service Overdue",value: counts.overdue,     icon: Calendar,      color: "text-red-400",     bg: "bg-red-500/15" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-200 tabular-nums">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Asset table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Asset", "Type", "Location", "Status", "Model / Serial", "Next Service"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((asset, i) => {
                const s = STATUS_STYLES[asset.status as keyof typeof STATUS_STYLES];
                const overdue = new Date(asset.next_service) < new Date();
                return (
                  <motion.tr
                    key={asset.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                        <span className="text-zinc-200 font-medium">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{asset.type}</td>
                    <td className="px-4 py-3 text-zinc-400">{asset.location}</td>
                    <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                    <td className="px-4 py-3">
                      <p className="text-zinc-400">{asset.model}</p>
                      <p className="text-xs text-zinc-600 font-mono">{asset.serial}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={overdue ? "text-red-400 font-medium" : "text-zinc-400"}>
                        {new Date(asset.next_service).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
