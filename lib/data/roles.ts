"use client";

import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types";

const sb = () => createClient();

export async function fetchRoles(): Promise<Role[]> {
  const supabase = sb();
  const [{ data: roles }, { data: perms }, { data: profiles }] = await Promise.all([
    supabase.from("roles").select("*").order("created_at"),
    supabase.from("role_permissions").select("role_id, permission"),
    supabase.from("profiles").select("role_id"),
  ]);
  return (roles ?? []).map((r) => ({
    ...r,
    permissions: (perms ?? []).filter((p) => p.role_id === r.id).map((p) => p.permission),
    _member_count: (profiles ?? []).filter((p) => p.role_id === r.id).length,
  })) as Role[];
}

// Current user's effective permission set, via the my_permissions() SQL function
export async function fetchMyPermissions(): Promise<string[]> {
  const { data, error } = await sb().rpc("my_permissions");
  if (error) return [];
  // rpc returns an array of { my_permissions: string } or plain strings depending on driver
  return (data ?? []).map((row: unknown) =>
    typeof row === "string" ? row : (row as { my_permissions: string }).my_permissions
  );
}

export async function togglePermission(roleId: string, permission: string, grant: boolean): Promise<void> {
  const supabase = sb();
  if (grant) {
    await supabase.from("role_permissions").upsert({ role_id: roleId, permission });
  } else {
    await supabase.from("role_permissions").delete().eq("role_id", roleId).eq("permission", permission);
  }
}

export async function setRolePermissions(roleId: string, permissions: string[]): Promise<void> {
  const supabase = sb();
  await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (permissions.length) {
    await supabase.from("role_permissions").insert(permissions.map((permission) => ({ role_id: roleId, permission })));
  }
}

export async function createRole(input: { name: string; description: string; color: string }): Promise<Role> {
  const supabase = sb();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("organization_id").eq("id", user!.id).single();
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const { data, error } = await supabase
    .from("roles")
    .insert({ ...input, slug, organization_id: me?.organization_id, is_system: false })
    .select("*").single();
  if (error) throw error;
  return data as Role;
}

export async function deleteRole(roleId: string): Promise<void> {
  const { error } = await sb().from("roles").delete().eq("id", roleId);
  if (error) throw error;
}

export async function assignRole(userId: string, roleId: string, roleSlug: string): Promise<void> {
  // keep legacy text role in sync for coarse RLS that still reads profiles.role
  const { error } = await sb().from("profiles").update({ role_id: roleId, role: roleSlug }).eq("id", userId);
  if (error) throw error;
}
