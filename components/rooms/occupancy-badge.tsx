import { User, DoorOpen, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Occupancy } from "@/types";

// Live occupancy — answers "is it safe to enter this room right now?"
const CONFIG: Record<Occupancy, { label: string; enter: string; cls: string; icon: typeof User }> = {
  occupied:  { label: "Occupied",  enter: "Guest in room — do not enter", cls: "bg-red-500/12 text-red-300 border-red-500/25",        icon: User },
  vacant:    { label: "Vacant",    enter: "Clear to enter",               cls: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25", icon: DoorOpen },
  arriving:  { label: "Arriving",  enter: "Checking in later — clear now", cls: "bg-amber-500/12 text-amber-300 border-amber-500/25",    icon: LogIn },
  departing: { label: "Departing", enter: "Checking out today",           cls: "bg-blue-500/12 text-blue-300 border-blue-500/25",       icon: LogOut },
};

export function OccupancyBadge({ occupancy, className }: { occupancy?: Occupancy; className?: string }) {
  const c = CONFIG[occupancy ?? "vacant"];
  const Icon = c.icon;
  return (
    <span title={c.enter} className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", c.cls, className)}>
      <Icon className="h-2.5 w-2.5" />
      {c.label}
    </span>
  );
}

export const occupancyEnterHint = (o?: Occupancy) => CONFIG[o ?? "vacant"].enter;
