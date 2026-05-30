"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, ClipboardList, Users,
  Settings, ChevronLeft, Zap, Package, BarChart3, LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/buildings", icon: Building2, label: "Buildings" },
  { href: "/work-orders", icon: ClipboardList, label: "Work Orders" },
  { href: "/technicians", icon: Users, label: "Technicians" },
  { href: "/assets", icon: Package, label: "Assets" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
];

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, profile } = useAppStore();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 232 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex h-screen flex-col bg-[#09091a] border-r border-white/[0.05] z-20 flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 px-4 border-b border-white/[0.05]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/25">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-bold text-zinc-100 tracking-tight whitespace-nowrap overflow-hidden"
              >
                FacilityFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            const item = (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-indigo-500/15"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 relative z-10", active && "text-indigo-400")} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10 whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{item}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return item;
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/[0.05] px-2 py-3 space-y-0.5">
          {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
            const item = (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-all duration-150"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap overflow-hidden">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
            if (sidebarCollapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{item}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return item;
          })}

          {/* Logout */}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap overflow-hidden">
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User profile */}
          <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 mt-1", sidebarCollapsed && "justify-center px-2")}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {getInitials(profile?.full_name ?? "User")}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 overflow-hidden">
                  <p className="text-xs font-medium text-zinc-300 truncate">{profile?.full_name ?? "Team Member"}</p>
                  <p className="text-[10px] text-zinc-500 capitalize truncate">{profile?.role ?? "viewer"}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full bg-[#141428] border border-white/[0.08] text-zinc-500 hover:text-zinc-300 transition-colors shadow-lg"
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="h-3 w-3" />
          </motion.div>
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}
