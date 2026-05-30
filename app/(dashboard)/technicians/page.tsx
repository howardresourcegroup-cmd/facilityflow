"use client";

import { motion } from "framer-motion";
import { Users, Plus, Phone, Wrench, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_PROFILES, MOCK_WORK_ORDERS } from "@/lib/mock-data";
import { cn, getInitials } from "@/lib/utils";
import type { Profile } from "@/types";

const technicians = MOCK_PROFILES.filter((p) => p.role === "technician" || p.role === "manager");

function TechCard({ tech, index }: { tech: Profile; index: number }) {
  const assignedOrders = MOCK_WORK_ORDERS.filter(
    (w) => w.assigned_to === tech.id && w.status !== "completed" && w.status !== "cancelled"
  );
  const completedToday = MOCK_WORK_ORDERS.filter(
    (w) => w.assigned_to === tech.id && w.status === "completed"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="glass-card p-5 space-y-4 hover:border-white/[0.1] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="text-sm">{getInitials(tech.full_name)}</AvatarFallback>
            </Avatar>
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0f0f1a]",
              tech.is_available ? "bg-emerald-400" : "bg-amber-400"
            )} />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">{tech.full_name}</p>
            <p className="text-xs text-zinc-500 capitalize">{tech.role}</p>
          </div>
        </div>
        <Badge variant={tech.is_available ? "success" : "warning"}>
          {tech.is_available ? "Available" : "On Task"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5 text-center">
          <p className="text-lg font-bold text-zinc-200 tabular-nums">{assignedOrders.length}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Active</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5 text-center">
          <p className="text-lg font-bold text-zinc-200 tabular-nums">{completedToday}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Closed</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5 text-center">
          <p className="text-lg font-bold text-zinc-200 tabular-nums">
            {assignedOrders.filter((w) => w.priority === "critical" || w.priority === "high").length}
          </p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Urgent</p>
        </div>
      </div>

      {/* Current task */}
      {assignedOrders[0] && (
        <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2.5">
          <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider mb-1">Current Task</p>
          <p className="text-xs text-zinc-300 line-clamp-1">{assignedOrders[0].title}</p>
        </div>
      )}

      {/* Phone */}
      {tech.phone && (
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Phone className="h-3 w-3" />
          {tech.phone}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="secondary" className="flex-1 text-xs">
          <Wrench className="h-3 w-3" />
          Assign Task
        </Button>
        <Button size="sm" variant="ghost" className="text-xs">
          View All
        </Button>
      </div>
    </motion.div>
  );
}

export default function TechniciansPage() {
  const available = technicians.filter((t) => t.is_available).length;
  const busy = technicians.filter((t) => !t.is_available).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Technicians</h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {available} available
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {busy} on task
            </span>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Technician
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Technicians", value: technicians.length, icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/15" },
          { label: "Resolved Today", value: MOCK_WORK_ORDERS.filter((w) => w.status === "completed").length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15" },
          { label: "Avg. Response", value: "28 min", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", bg)}>
              <Icon className={cn("h-4.5 w-4.5", color)} />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-200 tabular-nums">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Technician grid */}
      {technicians.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No technicians yet"
          description="Invite your maintenance team to start assigning and tracking work orders."
          action={{ label: "Add Technician", onClick: () => {} }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {technicians.map((t, i) => (
            <TechCard key={t.id} tech={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
