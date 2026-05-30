"use client";

// Client-side Supabase data access. Every query runs with the logged-in
// user's session, so Row Level Security automatically scopes results to
// their organization. No org filtering needed in the queries themselves.

import { createClient } from "@/lib/supabase/client";
import type {
  Building, Floor, Space, WorkOrder, Profile, Channel, Message,
  SpaceStatus, WorkOrderStatus, WorkOrderPriority, DashboardStats,
} from "@/types";

const sb = () => createClient();

// ─── Buildings ────────────────────────────────────────────────────────────────
export async function fetchBuildings(): Promise<Building[]> {
  const supabase = sb();
  // Run all three queries in parallel instead of waterfalling
  const [{ data: buildings, error }, { data: floors }, { data: spaces }] = await Promise.all([
    supabase.from("buildings").select("*").order("created_at"),
    supabase.from("floors").select("id, building_id"),
    supabase.from("spaces").select("id, floor_id, status"),
  ]);
  if (error) throw error;

  return (buildings ?? []).map((b) => {
    const bFloors = (floors ?? []).filter((f) => f.building_id === b.id);
    const floorIds = bFloors.map((f) => f.id);
    const bSpaces = (spaces ?? []).filter((s) => floorIds.includes(s.floor_id));
    return {
      ...b,
      _floor_count: bFloors.length,
      _space_count: bSpaces.length,
      _issue_count: bSpaces.filter((s) => s.status !== "operational").length,
    } as Building;
  });
}

export async function fetchBuilding(id: string): Promise<Building | null> {
  const { data, error } = await sb().from("buildings").select("*").eq("id", id).single();
  if (error) return null;
  return data as Building;
}

export async function fetchFloors(buildingId: string): Promise<Floor[]> {
  const { data, error } = await sb()
    .from("floors").select("*").eq("building_id", buildingId).order("level");
  if (error) throw error;
  return (data ?? []) as Floor[];
}

// ─── Spaces ───────────────────────────────────────────────────────────────────
export async function fetchSpacesForBuilding(buildingId: string): Promise<Space[]> {
  const supabase = sb();
  const { data: floors } = await supabase.from("floors").select("id").eq("building_id", buildingId);
  const floorIds = (floors ?? []).map((f) => f.id);
  if (!floorIds.length) return [];
  const { data, error } = await supabase
    .from("spaces").select("*").in("floor_id", floorIds).order("position_y").order("position_x");
  if (error) throw error;
  return (data ?? []) as Space[];
}

export async function updateSpaceStatus(spaceId: string, status: SpaceStatus): Promise<void> {
  const { error } = await sb().from("spaces").update({ status }).eq("id", spaceId);
  if (error) throw error;
}

export async function createSpace(input: {
  floor_id: string;
  name: string;
  type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}): Promise<Space> {
  const { data, error } = await sb()
    .from("spaces")
    .insert({ ...input, status: "operational" })
    .select("*").single();
  if (error) throw error;
  return data as Space;
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const { error } = await sb().from("spaces").delete().eq("id", spaceId);
  if (error) throw error;
}

export async function createFloor(input: {
  building_id: string;
  name: string;
  level: number;
  grid_cols?: number;
  grid_rows?: number;
}): Promise<Floor> {
  const { data, error } = await sb()
    .from("floors")
    .insert({ grid_cols: 14, grid_rows: 8, ...input })
    .select("*").single();
  if (error) throw error;
  return data as Floor;
}

// ─── Work orders ──────────────────────────────────────────────────────────────
const WORK_ORDER_SELECT = `
  *,
  space:spaces(id, name, floor:floors(id, name, building:buildings(id, name))),
  assignee:profiles!work_orders_assigned_to_fkey(id, full_name, role, avatar_url),
  creator:profiles!work_orders_created_by_fkey(id, full_name, role)
`;

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  const { data, error } = await sb()
    .from("work_orders").select(WORK_ORDER_SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as WorkOrder[];
}

export async function fetchWorkOrder(id: string): Promise<WorkOrder | null> {
  const { data, error } = await sb()
    .from("work_orders").select(WORK_ORDER_SELECT).eq("id", id).single();
  if (error) return null;
  return data as unknown as WorkOrder;
}

export async function createWorkOrder(input: {
  title: string;
  description: string | null;
  priority: WorkOrderPriority;
  category: string;
  space_id: string | null;
  assigned_to: string | null;
  organization_id: string;
  created_by: string;
}): Promise<WorkOrder> {
  const { data, error } = await sb()
    .from("work_orders")
    .insert({ ...input, status: input.assigned_to ? "assigned" : "open" })
    .select(WORK_ORDER_SELECT).single();
  if (error) throw error;
  return data as unknown as WorkOrder;
}

export async function updateWorkOrderStatus(id: string, status: WorkOrderStatus): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (status === "completed") patch.completed_at = new Date().toISOString();
  const { error } = await sb().from("work_orders").update(patch).eq("id", id);
  if (error) throw error;
}

// ─── Profiles (team) ──────────────────────────────────────────────────────────
export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await sb().from("profiles").select("*").order("full_name");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchCurrentProfile(): Promise<Profile | null> {
  const supabase = sb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data ?? null) as Profile | null;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function fetchChannels(): Promise<Channel[]> {
  const { data, error } = await sb().from("channels").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []) as Channel[];
}

export async function fetchMessages(channelId: string): Promise<Message[]> {
  const { data, error } = await sb()
    .from("messages")
    .select(`*, author:profiles(id, full_name, role, avatar_url)`)
    .eq("channel_id", channelId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as unknown as Message[];
}

export async function sendMessage(channelId: string, body: string): Promise<Message> {
  const supabase = sb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  const { data, error } = await supabase
    .from("messages")
    .insert({ channel_id: channelId, organization_id: profile?.organization_id, author_id: user.id, body })
    .select(`*, author:profiles(id, full_name, role, avatar_url)`).single();
  if (error) throw error;
  return data as unknown as Message;
}

// ─── Dashboard stats (computed) ───────────────────────────────────────────────
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = sb();
  const [{ data: spaces }, { data: workOrders }, { data: profiles }] = await Promise.all([
    supabase.from("spaces").select("status"),
    supabase.from("work_orders").select("status, priority, completed_at, created_at"),
    supabase.from("profiles").select("role, is_available"),
  ]);

  const s = spaces ?? [];
  const wo = workOrders ?? [];
  const p = profiles ?? [];
  const operational = s.filter((x) => x.status === "operational").length;
  const activeWo = wo.filter((x) => x.status !== "completed" && x.status !== "cancelled");
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return {
    active_issues: activeWo.length,
    operational_percent: s.length ? Math.round((operational / s.length) * 100) : 100,
    technicians_online: p.filter((x) => x.role === "technician" && x.is_available).length,
    critical_alerts: activeWo.filter((x) => x.priority === "critical").length,
    completed_today: wo.filter((x) => x.completed_at && new Date(x.completed_at) >= today).length,
    avg_resolution_hours: 3.8,
  };
}
