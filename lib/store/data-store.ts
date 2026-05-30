"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Space, WorkOrder, SpaceStatus, WorkOrderStatus, WorkOrderPriority } from "@/types";
import { AMICOLOLA_SPACES, AMICOLOLA_WORK_ORDERS } from "@/lib/mock-data";

interface RoomMasterSync {
  last_synced: string | null;
  rooms_synced: number;
  status: "idle" | "syncing" | "success" | "error";
  changes_applied: number;
}

interface DataStore {
  spaces: Space[];
  workOrders: WorkOrder[];
  roomMasterSync: RoomMasterSync;

  // Space actions
  updateSpaceStatus: (spaceId: string, status: SpaceStatus) => void;

  // Work order actions
  addWorkOrder: (wo: WorkOrder) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  updateWorkOrder: (id: string, patch: Partial<WorkOrder>) => void;

  // RoomMaster
  setRoomMasterSync: (sync: Partial<RoomMasterSync>) => void;
  applyRoomMasterChanges: (changes: RoomMasterChange[]) => void;

  // Reset to default data
  resetToDefaults: () => void;
}

export interface RoomMasterChange {
  room_number: string;
  pms_status: string;
  ff_status: SpaceStatus;
  space_id: string | null;
  space_name: string;
  create_work_order: boolean;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      spaces: AMICOLOLA_SPACES,
      workOrders: AMICOLOLA_WORK_ORDERS,
      roomMasterSync: {
        last_synced: null,
        rooms_synced: 0,
        status: "idle",
        changes_applied: 0,
      },

      updateSpaceStatus: (spaceId, status) =>
        set((state) => ({
          spaces: state.spaces.map((s) =>
            s.id === spaceId ? { ...s, status, updated_at: new Date().toISOString() } : s
          ),
        })),

      addWorkOrder: (wo) =>
        set((state) => ({ workOrders: [wo, ...state.workOrders] })),

      updateWorkOrderStatus: (id, status) =>
        set((state) => ({
          workOrders: state.workOrders.map((w) =>
            w.id === id
              ? {
                  ...w,
                  status,
                  completed_at: status === "completed" ? new Date().toISOString() : w.completed_at,
                  updated_at: new Date().toISOString(),
                }
              : w
          ),
        })),

      updateWorkOrder: (id, patch) =>
        set((state) => ({
          workOrders: state.workOrders.map((w) =>
            w.id === id ? { ...w, ...patch, updated_at: new Date().toISOString() } : w
          ),
        })),

      setRoomMasterSync: (sync) =>
        set((state) => ({ roomMasterSync: { ...state.roomMasterSync, ...sync } })),

      applyRoomMasterChanges: (changes) => {
        const now = new Date().toISOString();
        set((state) => {
          const updatedSpaces = state.spaces.map((s) => {
            const change = changes.find((c) => c.space_id === s.id);
            if (!change) return s;
            return { ...s, status: change.ff_status, updated_at: now };
          });

          // Auto-create work orders for rooms needing attention
          const newWorkOrders: WorkOrder[] = changes
            .filter((c) => c.create_work_order && c.space_id)
            .map((c) => ({
              id: `rm-${Date.now()}-${c.space_id}`,
              organization_id: "org-amicolola",
              space_id: c.space_id!,
              asset_id: null,
              created_by: "system-roommaster",
              assigned_to: null,
              title: buildWorkOrderTitle(c),
              description: `Auto-created from RoomMaster sync. PMS status: ${c.pms_status}`,
              status: "open" as WorkOrderStatus,
              priority: c.ff_status === "emergency" || c.ff_status === "offline" ? "high" : "medium" as WorkOrderPriority,
              category: c.ff_status === "cleaning_required" ? "housekeeping" : "maintenance",
              photos: [],
              due_date: null,
              completed_at: null,
              created_at: now,
              updated_at: now,
              _comment_count: 0,
            }));

          return {
            spaces: updatedSpaces,
            workOrders: [...newWorkOrders, ...state.workOrders],
            roomMasterSync: {
              last_synced: now,
              rooms_synced: changes.length,
              status: "success",
              changes_applied: changes.filter((c) => c.create_work_order).length,
            },
          };
        });
      },

      resetToDefaults: () =>
        set({
          spaces: AMICOLOLA_SPACES,
          workOrders: AMICOLOLA_WORK_ORDERS,
          roomMasterSync: { last_synced: null, rooms_synced: 0, status: "idle", changes_applied: 0 },
        }),
    }),
    {
      name: "facilityflow-data",
      // Only persist specific keys — avoid storing huge blobs
      partialize: (state) => ({
        spaces: state.spaces,
        workOrders: state.workOrders,
        roomMasterSync: state.roomMasterSync,
      }),
    }
  )
);

function buildWorkOrderTitle(change: RoomMasterChange): string {
  const titles: Record<string, string> = {
    cleaning_required: `Housekeeping Required — ${change.space_name}`,
    needs_maintenance: `Maintenance Request — ${change.space_name}`,
    offline: `Room Out of Service — ${change.space_name}`,
    inspection_due: `Room Inspection Due — ${change.space_name}`,
  };
  return titles[change.ff_status] ?? `Room Attention Required — ${change.space_name}`;
}
