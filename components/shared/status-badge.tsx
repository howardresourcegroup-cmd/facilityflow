import { cn, SPACE_STATUS_CONFIG, WORK_ORDER_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import type { SpaceStatus, WorkOrderStatus, WorkOrderPriority } from "@/types";

export function SpaceStatusBadge({ status }: { status: SpaceStatus }) {
  const cfg = SPACE_STATUS_CONFIG[status];
  return (
    <span className={cn("badge gap-1.5", cfg.bg, cfg.border, cfg.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  const cfg = WORK_ORDER_STATUS_CONFIG[status];
  return (
    <span className={cn("badge", cfg.bg, cfg.border, cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={cn("badge gap-1.5", cfg.bg, cfg.border, cfg.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
