"use client";

import { motion } from "framer-motion";
import {
  Plus, RefreshCw, UserCheck, MessageSquare, AlertTriangle,
} from "lucide-react";
import type { ActivityItem } from "@/types";
import { timeAgo, cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TYPE_CONFIG = {
  work_order_created:  { icon: Plus,         color: "text-indigo-400",  bg: "bg-indigo-500/15" },
  work_order_updated:  { icon: RefreshCw,    color: "text-blue-400",    bg: "bg-blue-500/15" },
  status_changed:      { icon: RefreshCw,    color: "text-amber-400",   bg: "bg-amber-500/15" },
  tech_assigned:       { icon: UserCheck,    color: "text-emerald-400", bg: "bg-emerald-500/15" },
  comment_added:       { icon: MessageSquare,color: "text-muted-foreground",    bg: "bg-foreground/[0.06]" },
  alert:               { icon: AlertTriangle,color: "text-red-400",     bg: "bg-red-500/15" },
};

function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.work_order_updated;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-start gap-3 py-3 border-b border-border last:border-0 group"
    >
      <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
        <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground leading-snug">{item.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-4 w-4">
            <AvatarFallback className="text-[8px] bg-indigo-500/20 text-indigo-300">
              {getInitials(item.user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{item.user.name}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{timeAgo(item.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Activity</p>
          <p className="text-base font-semibold text-foreground mt-0.5">Recent Events</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
        {items.map((item, i) => (
          <ActivityRow key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
