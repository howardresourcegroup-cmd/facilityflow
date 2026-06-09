"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, BedDouble, CircleCheck, Ban, ArrowRight } from "lucide-react";
import { useHousekeeping, usePermissions, useCurrentProfile } from "@/lib/data/hooks";
import { PageLoader } from "@/components/shared/loading-spinner";
import { OccupancyBadge } from "@/components/rooms/occupancy-badge";
import { cn } from "@/lib/utils";
import type { HousekeepingStatus, Space } from "@/types";

const COLUMNS: { status: HousekeepingStatus; label: string; color: string; bg: string; border: string; dot: string }[] = [
  { status: "dirty",          label: "Dirty",            color: "text-red-400",     bg: "bg-red-500/[0.06]",     border: "border-red-500/20",     dot: "bg-red-400" },
  { status: "in_progress",    label: "In Progress",      color: "text-blue-400",    bg: "bg-blue-500/[0.06]",    border: "border-blue-500/20",    dot: "bg-blue-400" },
  { status: "cleaned",        label: "Cleaned · Inspect",color: "text-cyan-400",    bg: "bg-cyan-500/[0.06]",    border: "border-cyan-500/20",    dot: "bg-cyan-400" },
  { status: "ready",          label: "Ready",            color: "text-emerald-400", bg: "bg-emerald-500/[0.06]", border: "border-emerald-500/20", dot: "bg-emerald-400" },
];

// What the "advance" button does in each column
const NEXT: Partial<Record<HousekeepingStatus, { to: HousekeepingStatus; label: string; managerOnly?: boolean }>> = {
  dirty:       { to: "in_progress", label: "Start" },
  in_progress: { to: "cleaned",     label: "Mark Cleaned" },
  cleaned:     { to: "ready",       label: "Inspect → Ready", managerOnly: true },
};

export default function HousekeepingPage() {
  const { rooms, loading, setStatus } = useHousekeeping();
  const { can } = usePermissions();
  const me = useCurrentProfile();
  const isManager = me?.role === "manager" || me?.role === "admin";
  const canClean = can("spaces.update_status");

  const byStatus = useMemo(() => {
    const map: Record<string, Space[]> = { dirty: [], in_progress: [], cleaned: [], ready: [], out_of_service: [] };
    for (const r of rooms) (map[r.housekeeping_status ?? "ready"] ??= []).push(r);
    return map;
  }, [rooms]);

  const readyCount = byStatus.ready?.length ?? 0;
  const dirtyCount = byStatus.dirty?.length ?? 0;
  const oos = byStatus.out_of_service ?? [];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Housekeeping Board</h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400"><CircleCheck className="h-3.5 w-3.5" />{readyCount} ready for check-in</span>
            <span className="flex items-center gap-1.5 text-red-400"><BedDouble className="h-3.5 w-3.5" />{dirtyCount} to clean</span>
            <span className="flex items-center gap-1.5 text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const list = byStatus[col.status] ?? [];
          const next = NEXT[col.status];
          return (
            <div key={col.status} className={cn("rounded-xl border p-3", col.bg, col.border)}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                  <span className={cn("text-sm font-semibold", col.color)}>{col.label}</span>
                </div>
                <span className="text-xs text-zinc-500 tabular-nums">{list.length}</span>
              </div>

              <div className="space-y-2 min-h-[60px]">
                {list.map((room) => {
                  const blocked = next?.managerOnly && !isManager;
                  return (
                    <motion.div
                      key={room.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-200">{room.name}</span>
                        <span className="text-[10px] text-zinc-600">
                          {(room as Space & { floor?: { building?: { name: string } } }).floor?.building?.name?.split(" ")[0] ?? ""}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <OccupancyBadge occupancy={room.occupancy} />
                      </div>
                      {next && canClean && (
                        <button
                          onClick={() => !blocked && setStatus(room.id, next.to)}
                          disabled={blocked}
                          className={cn(
                            "mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all",
                            blocked
                              ? "bg-white/[0.03] text-zinc-600 cursor-not-allowed"
                              : "bg-white/[0.06] text-zinc-200 hover:bg-white/[0.12] active:scale-[0.98]"
                          )}
                          title={blocked ? "Only a manager can mark a room ready" : undefined}
                        >
                          {next.label}
                          {!blocked && <ArrowRight className="h-3 w-3" />}
                        </button>
                      )}
                      {col.status === "ready" && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <CircleCheck className="h-3 w-3" /> Ready for guests
                        </div>
                      )}
                      {col.status === "ready" && canClean && (
                        <button onClick={() => setStatus(room.id, "dirty")}
                          className="mt-1 w-full text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                          Mark dirty (checkout)
                        </button>
                      )}
                    </motion.div>
                  );
                })}
                {list.length === 0 && <p className="text-xs text-zinc-700 text-center py-4">None</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Out of service */}
      {oos.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Out of Service ({oos.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {oos.map((r) => (
              <span key={r.id} className="text-xs text-zinc-500 bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-1">{r.name}</span>
            ))}
          </div>
        </div>
      )}

      {!canClean && (
        <p className="text-xs text-zinc-600 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" /> You have view-only access to the housekeeping board.
        </p>
      )}
    </div>
  );
}
