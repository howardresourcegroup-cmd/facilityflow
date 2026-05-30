"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import { getInitials } from "@/lib/utils";

const PAGE_META: Record<string, { title: string; action?: { label: string; href: string } }> = {
  "/": { title: "Operations Dashboard" },
  "/buildings": { title: "Buildings", action: { label: "Add Building", href: "/buildings?new=1" } },
  "/work-orders": { title: "Work Orders", action: { label: "New Work Order", href: "/work-orders/new" } },
  "/technicians": { title: "Technicians" },
  "/assets": { title: "Assets" },
  "/reports": { title: "Reports" },
  "/settings": { title: "Settings" },
};

export function Header() {
  const pathname = usePathname();
  const { notificationCount, profile } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const meta = Object.entries(PAGE_META).find(([key]) =>
    key === "/" ? pathname === "/" : pathname.startsWith(key)
  )?.[1] ?? { title: "FacilityFlow" };

  return (
    <header className="h-14 flex items-center gap-4 px-5 border-b border-white/[0.05] bg-[#080811]/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-zinc-200 truncate">{meta.title}</h1>
      </div>

      {/* Search */}
      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Input
              autoFocus
              placeholder="Search rooms, orders, people…"
              className="h-8 text-xs"
              onBlur={() => setSearchOpen(false)}
            />
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
          >
            <Search className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Action button */}
      {meta.action && (
        <Button size="sm" asChild>
          <Link href={meta.action.href}>
            <Plus className="h-4 w-4" />
            {meta.action.label}
          </Link>
        </Button>
      )}

      {/* Notifications */}
      <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors">
        <Bell className="h-4 w-4" />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </button>

      {/* Avatar */}
      <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500/40 transition-all">
        <AvatarImage src={profile?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs">{getInitials(profile?.full_name ?? "U")}</AvatarFallback>
      </Avatar>
    </header>
  );
}
