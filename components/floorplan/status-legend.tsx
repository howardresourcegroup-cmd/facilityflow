import { cn, SPACE_STATUS_CONFIG } from "@/lib/utils";
import type { SpaceStatus } from "@/types";

const STATUSES: SpaceStatus[] = [
  "operational", "needs_maintenance", "offline",
  "cleaning_required", "inspection_due", "emergency",
];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {STATUSES.map((s) => {
        const cfg = SPACE_STATUS_CONFIG[s];
        return (
          <span key={s} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}
