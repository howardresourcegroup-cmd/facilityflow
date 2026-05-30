"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Grid3x3, AlertTriangle, ArrowRight } from "lucide-react";
import type { Building } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  office: "🏢", hospital: "🏥", school: "🏫", retail: "🏬", warehouse: "🏭",
};

interface BuildingCardProps {
  building: Building;
  index?: number;
}

export function BuildingCard({ building, index = 0 }: BuildingCardProps) {
  const issueCount = building._issue_count ?? 0;
  const hasIssues = issueCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
    >
      <Link
        href={`/buildings/${building.id}`}
        className="group block glass-card p-5 hover:border-white/[0.12] hover:bg-[#141425] transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-xl">
              {TYPE_ICONS[building.type] ?? "🏢"}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                {building.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {building.city}, {building.state}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3 w-3" />
            {building._floor_count ?? 0} floors
          </span>
          <span className="flex items-center gap-1.5">
            <Grid3x3 className="h-3 w-3" />
            {building._space_count ?? 0} spaces
          </span>
        </div>

        {/* Issue indicator */}
        <div className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border",
          hasIssues
            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        )}>
          {hasIssues ? (
            <>
              <AlertTriangle className="h-3 w-3" />
              {issueCount} active issue{issueCount !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              All systems operational
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
