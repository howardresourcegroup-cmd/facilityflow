"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutGrid, ClipboardList, BedDouble, KeyRound, MessageSquare,
  ArrowRight, Check, Building2, RefreshCw,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

const FEATURES = [
  { icon: LayoutGrid, title: "Live floor plans", body: "Map any property top-down. Every room color-coded by status, updating in real time." },
  { icon: ClipboardList, title: "Work orders", body: "Log, assign, photo-document, and close maintenance — with full history and priorities." },
  { icon: BedDouble, title: "Housekeeping board", body: "Dirty → cleaning → ready, live. Front desk sees which rooms are ready the moment they are." },
  { icon: RefreshCw, title: "Syncs your PMS", body: "Two-way sync with RoomMaster and Eptura — adds a live operations layer, doesn't replace them." },
  { icon: KeyRound, title: "Roles & permissions", body: "Front desk, housekeeping, maintenance, GM — each role sees exactly what it needs. Fully configurable." },
  { icon: MessageSquare, title: "Team chat", body: "Coordinate in real time, organized by channel, encrypted in transit and at rest." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080811] text-zinc-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 rounded-lg shadow-lg shadow-indigo-500/30" />
          <span className="text-lg font-bold">Roomward</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Log in</Link>
          <Link href="/signup" className="btn-primary text-sm">Start free trial</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-6">
            <Building2 className="h-3 w-3" /> For hotels, lodges, parks & facilities
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            The operations layer<br />for your spaces.
          </h1>
          <p className="text-lg text-zinc-400 mt-5 max-w-2xl mx-auto leading-relaxed">
            Roomward keeps your team and your property in sync — live floor plans, work orders,
            housekeeping, and your PMS, all in one place. Where things get seen, assigned, and done.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/signup" className="btn-primary text-base h-11 px-6">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base h-11 px-6">
              View live demo
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-4">14 days free · no credit card required</p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="glass-card p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20 mb-3">
                <f.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">{f.title}</h3>
              <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Integrations strip */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20 text-center">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Works with the systems you already run</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
          {["RoomMaster", "Eptura Asset", "Opera", "Cloudbeds", "Maestro", "Stripe"].map((n) => (
            <span key={n} className="font-medium">{n}</span>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 max-w-md mx-auto px-6 pb-24">
        <div className="glass-card p-7 text-center border-indigo-500/20">
          <p className="text-sm font-semibold text-indigo-300">Roomward Standard</p>
          <div className="flex items-baseline justify-center gap-1 mt-3">
            <span className="text-4xl font-bold">$149</span>
            <span className="text-zinc-500">/mo per property</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Pro $249/mo for 25+ users</p>
          <a href="https://howardresourcegroup.com/business.html#hotel-stack" target="_blank" rel="noopener"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1.5">
            Save $100/mo with a Managed IT plan <ArrowRight className="h-3 w-3" />
          </a>
          <ul className="space-y-2 mt-5 text-left">
            {["Every feature included", "Unlimited rooms & spaces", "All integrations", "14-day free trial, no card"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="btn-primary w-full justify-center mt-6 h-11">
            Start your free trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <LogoMark className="h-4 w-4 rounded" />
            <span>© 2026 Roomward · by Howard Resource Group</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-zinc-400 transition-colors">Start free trial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
