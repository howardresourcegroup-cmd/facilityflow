"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ClipboardList, AlertTriangle, CheckCircle2, MapPin,
  Wrench, ChevronRight,
} from "lucide-react";
import type { Floor, Space, SpaceStatus } from "@/types";
import { cn, SPACE_STATUS_CONFIG, timeAgo } from "@/lib/utils";
import { RoomCell } from "./room-cell";
import { StatusLegend } from "./status-legend";
import { Button } from "@/components/ui/button";

const CELL_W = 90;
const CELL_H = 66;
const GAP = 4;

interface FloorGridProps {
  floor: Floor;
  spaces: Space[];
  onStatusChange?: (spaceId: string, status: SpaceStatus) => void;
  onCreateWorkOrder?: (spaceId: string) => void;
}

function RoomDetailPanel({
  space,
  onClose,
  onStatusChange,
  onCreateWorkOrder,
}: {
  space: Space;
  onClose: () => void;
  onStatusChange?: (status: SpaceStatus) => void;
  onCreateWorkOrder?: () => void;
}) {
  const cfg = SPACE_STATUS_CONFIG[space.status];
  const statuses = Object.keys(SPACE_STATUS_CONFIG) as SpaceStatus[];

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-72 flex-shrink-0 glass-card flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-white/[0.05]">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{space.type}</p>
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug">{space.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06] transition-colors shrink-0 ml-2"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Current status */}
      <div className={cn("mx-4 mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5 border", cfg.bg, cfg.border)}>
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dot)} />
        <div>
          <p className="text-xs text-zinc-500">Current Status</p>
          <p className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</p>
        </div>
      </div>

      {/* Notes */}
      {space.notes && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400 leading-relaxed">{space.notes}</p>
        </div>
      )}

      {/* Meta */}
      <div className="px-4 mt-4 space-y-2 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          Position ({space.position_x}, {space.position_y}) · {space.width}×{space.height} cells
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3" />
          Updated {timeAgo(space.updated_at)}
        </div>
      </div>

      {/* Change status */}
      <div className="px-4 mt-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Change Status</p>
        <div className="space-y-1">
          {statuses.map((s) => {
            const sc = SPACE_STATUS_CONFIG[s];
            const isActive = s === space.status;
            return (
              <button
                key={s}
                onClick={() => onStatusChange?.(s)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-left transition-all",
                  isActive
                    ? cn("border", sc.bg, sc.border, sc.color)
                    : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                {sc.label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mt-4 pb-4 space-y-2">
        <Button
          size="sm"
          className="w-full"
          onClick={onCreateWorkOrder}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Create Work Order
        </Button>
        {space.status !== "operational" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onStatusChange?.("operational")}
          >
            <Wrench className="h-3.5 w-3.5" />
            Mark Resolved
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function FloorGrid({ floor, spaces, onStatusChange, onCreateWorkOrder }: FloorGridProps) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gridW = floor.grid_cols * CELL_W + (floor.grid_cols - 1) * GAP;
  const gridH = floor.grid_rows * CELL_H + (floor.grid_rows - 1) * GAP;

  const handleStatusChange = useCallback(
    (status: SpaceStatus) => {
      if (!selectedSpace) return;
      onStatusChange?.(selectedSpace.id, status);
      setSelectedSpace((prev) => prev ? { ...prev, status } : null);
    },
    [selectedSpace, onStatusChange]
  );

  const issueCount = spaces.filter((s) => s.status !== "operational").length;

  return (
    <div className="space-y-4">
      {/* Floor summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StatusLegend />
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {issueCount > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
              <AlertTriangle className="h-3 w-3" />
              {issueCount} issue{issueCount !== 1 ? "s" : ""}
            </span>
          )}
          <span>{spaces.length} spaces mapped</span>
        </div>
      </div>

      {/* Grid + Detail panel */}
      <div className="flex gap-4 items-start">
        {/* Floorplan */}
        <div className="flex-1 overflow-auto">
          <div
            className="relative rounded-xl border border-white/[0.05] bg-[#0a0a16]"
            style={{
              width: gridW + 32,
              height: gridH + 32,
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
              `,
              backgroundSize: `${CELL_W + GAP}px ${CELL_H + GAP}px`,
              backgroundPosition: "16px 16px",
            }}
            ref={containerRef}
            onClick={(e) => {
              if (e.target === containerRef.current) setSelectedSpace(null);
            }}
          >
            <div className="relative" style={{ margin: 16, width: gridW, height: gridH }}>
              {spaces.map((space) => (
                <RoomCell
                  key={space.id}
                  space={space}
                  isSelected={selectedSpace?.id === space.id}
                  onClick={() => setSelectedSpace(space)}
                  cellW={CELL_W}
                  cellH={CELL_H}
                  gap={GAP}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedSpace && (
            <RoomDetailPanel
              space={selectedSpace}
              onClose={() => setSelectedSpace(null)}
              onStatusChange={handleStatusChange}
              onCreateWorkOrder={() => onCreateWorkOrder?.(selectedSpace.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
