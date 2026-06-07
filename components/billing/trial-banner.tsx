"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";
import { useBilling } from "@/lib/data/hooks";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "./upgrade-modal";
import { cn } from "@/lib/utils";

export function TrialBanner() {
  const { isActive, isTrialing, isExpired, daysLeft, loading } = useBilling();
  const [open, setOpen] = useState(false);

  if (loading || isActive) return null;

  // Trial active → slim countdown bar
  if (isTrialing) {
    const urgent = daysLeft <= 3;
    return (
      <>
        <div className={cn(
          "flex items-center justify-center gap-3 px-4 py-1.5 text-xs border-b",
          urgent ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
        )}>
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your free trial
          </span>
          <button onClick={() => setOpen(true)} className="font-semibold underline underline-offset-2 hover:opacity-80">
            Upgrade now
          </button>
        </div>
        <UpgradeModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  // Trial expired → full soft paywall overlay
  if (isExpired) {
    return (
      <>
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md glass-card p-7 text-center"
          >
            <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Your free trial has ended</h2>
            <p className="text-sm text-zinc-400 mt-2">
              Subscribe to keep your team running on Roomward. Your data is safe and waiting.
            </p>
            <Button className="w-full mt-5" onClick={() => setOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Subscribe to Roomward Pro
            </Button>
            <p className="text-[11px] text-zinc-600 mt-3">Questions? support@roomward.app</p>
          </motion.div>
        </div>
        <UpgradeModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return null;
}
