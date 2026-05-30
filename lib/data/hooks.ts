"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import * as q from "./queries";
import { fetchRoles, fetchMyPermissions } from "./roles";
import type {
  Building, Floor, Space, WorkOrder, Profile, Channel, Message, Role,
  SpaceStatus, WorkOrderStatus, DashboardStats,
} from "@/types";

// ─── Tiny stale-while-revalidate cache ────────────────────────────────────────
// Survives client-side navigation (module scope), so revisiting a page shows
// the last data instantly while a fresh fetch updates it in the background.
const cache = new Map<string, unknown>();

function useCachedQuery<T>(key: string, fetcher: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>((cache.get(key) as T) ?? initial);
  const [loading, setLoading] = useState(!cache.has(key));

  const reload = useCallback(() => {
    fetcher().then((d) => { cache.set(key, d); setData(d); setLoading(false); })
             .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { reload(); }, [reload]);
  return { data, loading, reload, setData };
}

// ─── Buildings list ───────────────────────────────────────────────────────────
export function useBuildings() {
  const { data: buildings, loading, reload } = useCachedQuery<Building[]>("buildings", q.fetchBuildings, []);
  return { buildings, loading, reload };
}

// ─── Building detail (floors + spaces, with live status updates) ──────────────
export function useBuildingDetail(buildingId: string) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      q.fetchBuilding(buildingId),
      q.fetchFloors(buildingId),
      q.fetchSpacesForBuilding(buildingId),
    ]).then(([b, f, s]) => {
      if (!active) return;
      setBuilding(b); setFloors(f); setSpaces(s); setLoading(false);
    }).catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [buildingId]);

  // Realtime: reflect space status changes from other users
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`spaces-${buildingId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "spaces" },
        (payload) => {
          const updated = payload.new as Space;
          setSpaces((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [buildingId]);

  const setSpaceStatus = useCallback(async (spaceId: string, status: SpaceStatus) => {
    setSpaces((prev) => prev.map((s) => (s.id === spaceId ? { ...s, status } : s))); // optimistic
    try { await q.updateSpaceStatus(spaceId, status); } catch { /* realtime will reconcile */ }
  }, []);

  const addSpace = useCallback((space: Space) => setSpaces((prev) => [...prev, space]), []);
  const removeSpace = useCallback((id: string) => setSpaces((prev) => prev.filter((s) => s.id !== id)), []);

  return { building, floors, spaces, loading, setSpaceStatus, addSpace, removeSpace };
}

// ─── Work orders ──────────────────────────────────────────────────────────────
export function useWorkOrders() {
  const { data: workOrders, loading, reload } = useCachedQuery<WorkOrder[]>("work_orders", q.fetchWorkOrders, []);
  return { workOrders, loading, reload };
}

export function useWorkOrder(id: string) {
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    q.fetchWorkOrder(id).then((o) => { setOrder(o); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const setStatus = useCallback(async (status: WorkOrderStatus) => {
    setOrder((prev) => prev ? { ...prev, status } : prev); // optimistic
    await q.updateWorkOrderStatus(id, status);
  }, [id]);

  return { order, loading, setStatus };
}

// ─── Team ─────────────────────────────────────────────────────────────────────
export function useProfiles() {
  const { data: profiles, loading } = useCachedQuery<Profile[]>("profiles", q.fetchProfiles, []);
  return { profiles, loading };
}

export function useCurrentProfile() {
  const { data } = useCachedQuery<Profile | null>("current_profile", q.fetchCurrentProfile, null);
  return data;
}

// ─── Roles & permissions ──────────────────────────────────────────────────────
export function useRoles() {
  const { data: roles, loading, reload } = useCachedQuery<Role[]>("roles", fetchRoles, []);
  return { roles, loading, reload };
}

// The current user's effective permissions + a `can()` checker.
// Fails open to true while loading so the UI doesn't flicker-hide actions;
// the server (RLS) is the real enforcement boundary.
export function usePermissions() {
  const { data: perms, loading } = useCachedQuery<string[]>("my_permissions", fetchMyPermissions, []);
  const can = useCallback(
    (permission: string) => loading || perms.length === 0 || perms.includes(permission),
    [perms, loading]
  );
  return { permissions: perms, can, loading };
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export function useDashboardStats() {
  const { data } = useCachedQuery<DashboardStats | null>("dashboard_stats", q.fetchDashboardStats, null);
  return data;
}

// ─── Chat (with realtime) ─────────────────────────────────────────────────────
export function useChannels() {
  const { data } = useCachedQuery<Channel[]>("channels", q.fetchChannels, []);
  return data;
}

export function useMessages(channelId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    q.fetchMessages(channelId).then((m) => { setMessages(m); setLoading(false); }).catch(() => setLoading(false));
  }, [channelId]);

  // Realtime: new messages appear instantly for everyone in the channel
  useEffect(() => {
    if (!channelId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${channelId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const m = payload.new as Message;
          // Fetch author for display
          const { data: author } = await supabase.from("profiles").select("id, full_name, role, avatar_url").eq("id", m.author_id).single();
          setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, { ...m, author: author as Profile }]);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [channelId]);

  const send = useCallback(async (body: string) => {
    if (!channelId) return;
    await q.sendMessage(channelId, body); // realtime INSERT echoes it back
  }, [channelId]);

  return { messages, loading, send };
}
