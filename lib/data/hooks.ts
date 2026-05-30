"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import * as q from "./queries";
import type {
  Building, Floor, Space, WorkOrder, Profile, Channel, Message,
  SpaceStatus, WorkOrderStatus, DashboardStats,
} from "@/types";

// ─── Buildings list ───────────────────────────────────────────────────────────
export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    q.fetchBuildings().then((b) => { setBuildings(b); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return { buildings, loading };
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

  return { building, floors, spaces, loading, setSpaceStatus };
}

// ─── Work orders ──────────────────────────────────────────────────────────────
export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    q.fetchWorkOrders().then((w) => { setWorkOrders(w); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);
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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    q.fetchProfiles().then((p) => { setProfiles(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return { profiles, loading };
}

export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => { q.fetchCurrentProfile().then(setProfile).catch(() => {}); }, []);
  return profile;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  useEffect(() => { q.fetchDashboardStats().then(setStats).catch(() => {}); }, []);
  return stats;
}

// ─── Chat (with realtime) ─────────────────────────────────────────────────────
export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  useEffect(() => { q.fetchChannels().then(setChannels).catch(() => {}); }, []);
  return channels;
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
