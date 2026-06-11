"use client";

import { motion } from "framer-motion";
import { Wrench, WifiOff, Sparkles, Search, Siren } from "lucide-react";
import type { Space, SpaceStatus } from "@/types";
import { cn, SPACE_STATUS_CONFIG } from "@/lib/utils";

const STATUS_ICONS: Record<SpaceStatus, React.ElementType> = {
  operational:       Sparkles,
  needs_maintenance: Wrench,
  offline:           WifiOff,
  cleaning_required: Sparkles,
  inspection_due:    Search,
  emergency:         Siren,
};

interface RoomCellProps {
  space: Space;
  isSelected: boolean;
  onClick: () => void;
  cellW: number;
  cellH: number;
  gap: number;
}

export function RoomCell({ space, isSelected, onClick, cellW, cellH, gap }: RoomCellProps) {
  const cfg = SPACE_STATUS_CONFIG[space.status];
  const Icon = STATUS_ICONS[space.status];
  const isEmergency = space.status === "emergency";
  const isOperational = space.status === "operational";

  const w = space.width * cellW + (space.width - 1) * gap;
  const h = space.height * cellH + (space.height - 1) * gap;
  const x = (space.position_x - 1) * (cellW + gap);
  const y = (space.position_y - 1) * (cellH + gap);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.03, zIndex: 20 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "absolute flex flex-col justify-between rounded-lg border text-left overflow-hidden",
        "transition-all duration-200 cursor-pointer group",
        cfg.bg, cfg.border,
        isSelected && "ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#080811]",
        isEmergency && "animate-pulse-slow shadow-lg shadow-red-500/30",
      )}
      style={{ left: x, top: y, width: w, height: h }}
    >
      {/* Top bar - status color accent (cfg.dot is a static color class) */}
      <div className={cn("h-0.5 w-full opacity-60", cfg.dot)} />

      <div className="flex-1 p-2 flex flex-col justify-between min-h-0">
        {/* Room name */}
        <p className={cn(
          "text-[10px] font-semibold leading-tight line-clamp-2 transition-colors",
          cfg.color
        )}>
          {space.name}
        </p>

        <div className="flex items-end justify-between mt-1">
          {/* Status dot */}
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />

          {/* Icon for non-operational states */}
          {!isOperational && (
            <Icon className={cn("h-3 w-3 opacity-60", cfg.color)} />
          )}
        </div>
      </div>
    </motion.button>
  );
}
