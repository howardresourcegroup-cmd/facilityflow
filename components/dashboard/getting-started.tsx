"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Rocket, ChevronRight } from "lucide-react";
import { CHECKLIST } from "@/lib/tutorials";
import { cn } from "@/lib/utils";

const STORE_KEY = "ff-getting-started";

export function GettingStarted() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(true); // start hidden until we read storage

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
      setDone(raw.done ?? {});
      setDismissed(raw.dismissed ?? false);
    } catch { setDismissed(false); }
  }, []);

  const persist = (next: { done?: Record<string, boolean>; dismissed?: boolean }) => {
    const merged = { done, dismissed, ...next };
    localStorage.setItem(STORE_KEY, JSON.stringify(merged));
  };

  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next); persist({ done: next });
  };

  const dismiss = () => { setDismissed(true); persist({ dismissed: true }); };

  const completed = CHECKLIST.filter((c) => done[c.id]).length;
  const pct = Math.round((completed / CHECKLIST.length) * 100);

  if (dismissed || completed === CHECKLIST.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="glass-card p-5 border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.06] to-transparent"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Rocket className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Get set up</p>
              <p className="text-xs text-zinc-500">{completed} of {CHECKLIST.length} done · {pct}%</p>
            </div>
          </div>
          <button onClick={dismiss} className="text-zinc-600 hover:text-zinc-400 transition-colors" title="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden mb-4">
          <motion.div className="h-full bg-indigo-500 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>

        <div className="space-y-1.5">
          {CHECKLIST.map((item) => {
            const isDone = !!done[item.id];
            return (
              <div key={item.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                    isDone ? "bg-indigo-500 border-indigo-500" : "border-white/[0.15] hover:border-indigo-500/50"
                  )}
                >
                  {isDone && <Check className="h-3 w-3 text-white" />}
                </button>
                <Link
                  href={item.href}
                  className={cn(
                    "flex-1 flex items-center justify-between text-sm transition-colors py-0.5",
                    isDone ? "text-zinc-600 line-through" : "text-zinc-300 hover:text-zinc-100"
                  )}
                >
                  {item.label}
                  {!isDone && <ChevronRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-500" />}
                </Link>
              </div>
            );
          })}
        </div>

        <Link href="/help" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-4 transition-colors">
          Browse all guides
          <ChevronRight className="h-3 w-3" />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
