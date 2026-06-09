import { create } from "zustand";
import type { Building, Floor, Space, WorkOrder, Profile } from "@/types";

interface AppState {
  selectedBuilding: Building | null;
  selectedFloor: Floor | null;
  selectedSpace: Space | null;
  selectedWorkOrder: WorkOrder | null;

  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  notificationCount: number;

  profile: Profile | null;

  setSelectedBuilding: (b: Building | null) => void;
  setSelectedFloor: (f: Floor | null) => void;
  setSelectedSpace: (s: Space | null) => void;
  setSelectedWorkOrder: (w: WorkOrder | null) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setNotificationCount: (n: number) => void;
  setProfile: (p: Profile | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedBuilding: null,
  selectedFloor: null,
  selectedSpace: null,
  selectedWorkOrder: null,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  notificationCount: 3,
  profile: null,

  setSelectedBuilding: (b) => set({ selectedBuilding: b, selectedFloor: null, selectedSpace: null }),
  setSelectedFloor: (f) => set({ selectedFloor: f, selectedSpace: null }),
  setSelectedSpace: (s) => set({ selectedSpace: s }),
  setSelectedWorkOrder: (w) => set({ selectedWorkOrder: w }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setNotificationCount: (n) => set({ notificationCount: n }),
  setProfile: (p) => set({ profile: p }),
}));
