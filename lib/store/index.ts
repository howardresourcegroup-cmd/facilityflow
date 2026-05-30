import { create } from "zustand";
import type { Building, Floor, Space, WorkOrder, Profile } from "@/types";

interface AppState {
  // Active selections
  selectedBuilding: Building | null;
  selectedFloor: Floor | null;
  selectedSpace: Space | null;
  selectedWorkOrder: WorkOrder | null;

  // UI state
  sidebarCollapsed: boolean;
  notificationCount: number;

  // Current user profile
  profile: Profile | null;

  // Actions
  setSelectedBuilding: (b: Building | null) => void;
  setSelectedFloor: (f: Floor | null) => void;
  setSelectedSpace: (s: Space | null) => void;
  setSelectedWorkOrder: (w: WorkOrder | null) => void;
  toggleSidebar: () => void;
  setNotificationCount: (n: number) => void;
  setProfile: (p: Profile | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedBuilding: null,
  selectedFloor: null,
  selectedSpace: null,
  selectedWorkOrder: null,
  sidebarCollapsed: false,
  notificationCount: 3,
  profile: null,

  setSelectedBuilding: (b) => set({ selectedBuilding: b, selectedFloor: null, selectedSpace: null }),
  setSelectedFloor: (f) => set({ selectedFloor: f, selectedSpace: null }),
  setSelectedSpace: (s) => set({ selectedSpace: s }),
  setSelectedWorkOrder: (w) => set({ selectedWorkOrder: w }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setNotificationCount: (n) => set({ notificationCount: n }),
  setProfile: (p) => set({ profile: p }),
}));
