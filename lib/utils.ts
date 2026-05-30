import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import type { SpaceStatus, WorkOrderStatus, WorkOrderPriority } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function formatDate(dateStr: string, fmt = "MMM d, yyyy"): string {
  return format(parseISO(dateStr), fmt);
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d, yyyy 'at' h:mm a");
}

// ─── Status configs ───────────────────────────────────────────────────────────

export const SPACE_STATUS_CONFIG: Record<
  SpaceStatus,
  { label: string; color: string; bg: string; border: string; dot: string; glow: string }
> = {
  operational: {
    label: "Operational",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  needs_maintenance: {
    label: "Needs Maintenance",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
  },
  offline: {
    label: "Offline",
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    dot: "bg-red-400",
    glow: "shadow-red-500/20",
  },
  cleaning_required: {
    label: "Cleaning Required",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  inspection_due: {
    label: "Inspection Due",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
    glow: "shadow-orange-500/20",
  },
  emergency: {
    label: "Emergency",
    color: "text-red-300",
    bg: "bg-red-500/25",
    border: "border-red-500/60",
    dot: "bg-red-400 animate-pulse",
    glow: "shadow-red-500/40",
  },
};

export const WORK_ORDER_STATUS_CONFIG: Record<
  WorkOrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  open: {
    label: "Open",
    color: "text-zinc-300",
    bg: "bg-zinc-700/50",
    border: "border-zinc-600/50",
  },
  assigned: {
    label: "Assigned",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
  },
  in_progress: {
    label: "In Progress",
    color: "text-indigo-400",
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/30",
  },
  waiting_parts: {
    label: "Waiting Parts",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-zinc-500",
    bg: "bg-zinc-800/50",
    border: "border-zinc-700/50",
  },
};

export const PRIORITY_CONFIG: Record<
  WorkOrderPriority,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  low: {
    label: "Low",
    color: "text-zinc-400",
    bg: "bg-zinc-700/40",
    border: "border-zinc-600/40",
    dot: "bg-zinc-400",
  },
  medium: {
    label: "Medium",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  high: {
    label: "High",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
  },
  critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    dot: "bg-red-400 animate-pulse",
  },
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function pluralize(count: number, word: string, plural?: string): string {
  return `${count} ${count === 1 ? word : plural ?? word + "s"}`;
}
