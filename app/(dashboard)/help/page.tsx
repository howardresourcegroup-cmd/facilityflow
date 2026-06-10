"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, LayoutGrid, ClipboardList, KeyRound, Users, Zap, MessageSquare, BarChart3,
  ChevronDown, Clock, BookOpen, Search,
} from "lucide-react";
import { TUTORIALS } from "@/lib/tutorials";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Rocket, LayoutGrid, ClipboardList, KeyRound, Users, Zap, MessageSquare, BarChart3,
};

export default function HelpPage() {
  const [open, setOpen] = useState<string | null>("getting-started");
  const [query, setQuery] = useState("");

  const filtered = TUTORIALS.filter((t) =>
    !query.trim() ||
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.summary.toLowerCase().includes(query.toLowerCase()) ||
    t.steps.some((s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.body.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Hero */}
      <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/[0.08] to-transparent border-indigo-500/15">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Help &amp; Guides</h1>
            <p className="text-sm text-zinc-500">Everything you need to run Roomward.</p>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <Input placeholder="Search the guides…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Tutorials */}
      <div className="space-y-3">
        {filtered.map((t, i) => {
          const Icon = ICONS[t.icon] ?? Rocket;
          const isOpen = open === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpen(isOpen ? null : t.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">{t.title}</h3>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="h-2.5 w-2.5" />{t.minutes} min
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{t.summary}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-zinc-600 transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ol className="px-5 pb-5 space-y-3 border-t border-white/[0.05] pt-4">
                      {t.steps.map((step, si) => (
                        <li key={si} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-semibold">
                            {si + 1}
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <p className="text-sm font-medium text-zinc-200">{step.title}</p>
                            <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">{step.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass-card p-8 text-center text-sm text-zinc-500">
            No guides match &ldquo;{query}&rdquo;.
          </div>
        )}
      </div>

      <p className="text-center text-xs text-zinc-600 pt-2">
        Still stuck? Email <span className="text-zinc-400">support@roomward.app</span> — we&apos;re happy to help.
      </p>
    </div>
  );
}
