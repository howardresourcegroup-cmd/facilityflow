"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Plus, LogOut, Settings as SettingsIcon, User, CheckCheck, AlertTriangle, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrentProfile, useWorkOrders } from "@/lib/data/hooks";
import { createClient } from "@/lib/supabase/client";
import { getInitials, cn, timeAgo } from "@/lib/utils";

const PAGE_META: Record<string, { title: string; action?: { label: string; href: string } }> = {
  "/": { title: "Operations Dashboard" },
  "/buildings": { title: "Buildings", action: { label: "Add Building", href: "/buildings?new=1" } },
  "/work-orders": { title: "Work Orders", action: { label: "New Work Order", href: "/work-orders/new" } },
  "/messages": { title: "Team Chat" },
  "/technicians": { title: "Technicians" },
  "/assets": { title: "Assets" },
  "/reports": { title: "Reports" },
  "/settings": { title: "Settings" },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useCurrentProfile();
  const { workOrders } = useWorkOrders();
  const [searchOpen, setSearchOpen] = useState(false);

  // Derive notifications from the most recent active, high-signal work orders
  const notifications = workOrders
    .filter((w) => w.status !== "completed" && w.status !== "cancelled")
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 6);
  const notificationCount = notifications.filter((w) => w.priority === "critical" || w.priority === "high").length;

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut().catch(() => {});
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };

  const notifIcon = (priority: string) =>
    priority === "critical" ? AlertTriangle : priority === "high" ? Wrench : Sparkles;

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-sm font-semibold text-zinc-200">Notifications</span>
            <span className="text-[10px] text-zinc-500">{notifications.length} active</span>
          </div>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCheck className="h-5 w-5 text-emerald-400 mb-1.5" />
              <p className="text-xs text-zinc-400">You&apos;re all caught up</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((w) => {
                const Icon = notifIcon(w.priority);
                const color = w.priority === "critical" ? "text-red-400" : w.priority === "high" ? "text-orange-400" : "text-zinc-400";
                return (
                  <DropdownMenuItem key={w.id} asChild>
                    <Link href={`/work-orders/${w.id}`} className="flex items-start gap-2.5">
                      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", color)} />
                      <span className="min-w-0">
                        <span className="block text-xs text-zinc-200 truncate">{w.title}</span>
                        <span className="block text-[10px] text-zinc-500">
                          {w.space?.name ? `${w.space.name} · ` : ""}{timeAgo(w.created_at)}
                        </span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/work-orders" className="justify-center text-xs text-indigo-400">View all work orders</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500/40 transition-all">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{getInitials(profile?.full_name ?? "U")}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">{getInitials(profile?.full_name ?? "U")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{profile?.full_name ?? "Account"}</p>
                <p className="text-[11px] text-zinc-500 capitalize truncate">{profile?.role ?? "member"}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings"><User className="text-zinc-500" />Profile &amp; account</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings"><SettingsIcon className="text-zinc-500" />Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={signOut}>
            <LogOut />Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
