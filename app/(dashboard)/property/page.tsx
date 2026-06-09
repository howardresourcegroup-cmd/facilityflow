"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Layers, DoorClosed, Filter } from "lucide-react";
import { useBuildings, useBuildingDetail } from "@/lib/data/hooks";
import { OccupancyBadge } from "@/components/rooms/occupancy-badge";
import { PageLoader } from "@/components/shared/loading-spinner";
import { SPACE_STATUS_CONFIG, cn } from "@/lib/utils";
import type { Space, Occupancy, HousekeepingStatus } from "@/types";

type Mode = "status" | "housekeeping" | "occupancy";

const HK_COLOR: Record<HousekeepingStatus, string> = {
  dirty: "bg-red-400", in_progress: "bg-blue-400", cleaned: "bg-cyan-400", ready: "bg-emerald-400", out_of_service: "bg-zinc-500",
};
const OCC_COLOR: Record<Occupancy, string> = {
  occupied: "bg-red-400", vacant: "bg-emerald-400", arriving: "bg-amber-400", departing: "bg-blue-400",
};
const GUEST_TYPES = ["guest_room", "suite", "cabin"];

function dotFor(mode: Mode, s: Space): string {
  if (mode === "occupancy") return OCC_COLOR[s.occupancy ?? "vacant"];
  if (mode === "housekeeping") return HK_COLOR[s.housekeeping_status ?? "ready"];
  return SPACE_STATUS_CONFIG[s.status]?.dot ?? "bg-zinc-500";
}
function labelFor(mode: Mode, s: Space): string {
  if (mode === "occupancy") return s.occupancy ?? "vacant";
  if (mode === "housekeeping") return (s.housekeeping_status ?? "ready").replace(/_/g, " ");
  return SPACE_STATUS_CONFIG[s.status]?.label ?? s.status;
}

export default function PropertyPage() {
  const { buildings, loading: bLoading } = useBuildings();
  const [bId, setBId] = useState("");
  useEffect(() => { if (!bId && buildings.length) setBId(buildings[0].id); }, [buildings, bId]);

  const { floors, spaces, loading: dLoading } = useBuildingDetail(bId);
  const [fId, setFId] = useState("");
  useEffect(() => { setFId(floors[0]?.id ?? ""); }, [floors, bId]);

  const [mode, setMode] = useState<Mode>("occupancy");
  const [guestOnly, setGuestOnly] = useState(true);
  const [selected, setSelected] = useState<Space | null>(null);

  const rooms = useMemo(() => {
    let list = spaces.filter((s) => s.floor_id === fId);
    if (guestOnly) list = list.filter((s) => GUEST_TYPES.includes(s.type));
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [spaces, fId, guestOnly]);

  const counts = useMemo(() => ({
    occupied: rooms.filter((r) => r.occupancy === "occupied").length,
    vacant: rooms.filter((r) => (r.occupancy ?? "vacant") === "vacant").length,
    dirty: rooms.filter((r) => r.housekeeping_status === "dirty").length,
  }), [rooms]);

  if (bLoading) return <PageLoader />;
  if (!buildings.length) return null; // setup gate handles the empty state

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Property Map</h1>
        <p className="text-sm text-zinc-500 mt-1">Drill through buildings, floors, and rooms — live status, housekeeping, and occupancy.</p>
      </div>

      {/* Buildings */}
      <div className="flex flex-wrap gap-2">
        {buildings.map((b) => (
          <button key={b.id} onClick={() => setBId(b.id)}
            className={cn("inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors",
              bId === b.id ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-200" : "border-white/[0.08] text-zinc-400 hover:border-white/20")}>
            <Building2 className="h-3.5 w-3.5" /> {b.name}
          </button>
        ))}
      </div>

      {dLoading ? <PageLoader /> : (
        <>
          {/* Floors */}
          <div className="flex flex-wrap items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-600" />
            {floors.map((f) => (
              <button key={f.id} onClick={() => setFId(f.id)}
                className={cn("text-xs px-2.5 py-1 rounded-md border transition-colors",
                  fId === f.id ? "bg-white/[0.08] border-white/20 text-zinc-200" : "border-white/[0.06] text-zinc-500 hover:text-zinc-300")}>
                {f.name}
              </button>
            ))}
            {floors.length === 0 && <span className="text-xs text-zinc-600">No floors on this building yet.</span>}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-white/[0.08] p-0.5">
              {(["occupancy", "housekeeping", "status"] as Mode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={cn("text-xs px-3 py-1.5 rounded-md capitalize transition-colors",
                    mode === m ? "bg-indigo-500/20 text-indigo-200" : "text-zinc-500 hover:text-zinc-300")}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 flex items-center gap-3">
                <span className="text-emerald-400">{counts.vacant} vacant</span>
                <span className="text-red-400">{counts.occupied} occupied</span>
                <span className="text-red-300">{counts.dirty} dirty</span>
              </span>
              <button onClick={() => setGuestOnly((v) => !v)}
                className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors",
                  guestOnly ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-200" : "border-white/[0.08] text-zinc-400")}>
                <Filter className="h-3 w-3" /> {guestOnly ? "Guest rooms" : "All spaces"}
              </button>
            </div>
          </div>

          {/* Room grid + detail */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
              {rooms.map((r) => (
                <motion.button key={r.id} layout onClick={() => setSelected(r)}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className={cn("text-left glass-card p-2.5 hover:border-white/[0.15] transition-colors",
                    selected?.id === r.id && "border-indigo-500/50")}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-200">{r.name}</span>
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dotFor(mode, r))} title={labelFor(mode, r)} />
                  </div>
                  <div className="mt-1.5"><OccupancyBadge occupancy={r.occupancy} /></div>
                </motion.button>
              ))}
              {rooms.length === 0 && <p className="text-sm text-zinc-600 col-span-full py-8 text-center">No rooms match — try toggling “All spaces” or pick another floor.</p>}
            </div>

            {selected && (
              <motion.div initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="w-64 shrink-0 glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-100">{selected.name}</h3>
                  <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>
                </div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{selected.type.replace(/_/g, " ")}</p>
                <div className="space-y-2 text-xs">
                  <Row label="Occupancy"><OccupancyBadge occupancy={selected.occupancy} /></Row>
                  <Row label="Housekeeping"><span className="capitalize text-zinc-300">{(selected.housekeeping_status ?? "ready").replace(/_/g, " ")}</span></Row>
                  <Row label="Condition"><span className={SPACE_STATUS_CONFIG[selected.status]?.color}>{SPACE_STATUS_CONFIG[selected.status]?.label}</span></Row>
                </div>
                <Link href="/work-orders/new" className="btn-secondary w-full justify-center text-xs h-8">
                  <DoorClosed className="h-3.5 w-3.5" /> Log an issue here
                </Link>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      {children}
    </div>
  );
}
