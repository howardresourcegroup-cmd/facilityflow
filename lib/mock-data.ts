import type { Building, Floor, Space, WorkOrder, Profile, ActivityItem, DashboardStats } from "@/types";

// ─── Organization ─────────────────────────────────────────────────────────────
export const DEMO_ORG = {
  id: "org-amicolola",
  name: "Grandview Resort & Lodge",
  slug: "amicalola-falls",
  plan: "pro" as const,
};

// ─── Team ─────────────────────────────────────────────────────────────────────
export const MOCK_PROFILES: Profile[] = [
  { id: "t1", organization_id: "org-amicolola", full_name: "Marcus Webb",    avatar_url: null, role: "technician", phone: "706-265-0101", is_available: false, created_at: "2024-01-10T00:00:00Z", updated_at: "2024-01-10T00:00:00Z" },
  { id: "t2", organization_id: "org-amicolola", full_name: "Priya Patel",    avatar_url: null, role: "technician", phone: "706-265-0102", is_available: true,  created_at: "2024-01-10T00:00:00Z", updated_at: "2024-01-10T00:00:00Z" },
  { id: "t3", organization_id: "org-amicolola", full_name: "James Okafor",   avatar_url: null, role: "technician", phone: "706-265-0103", is_available: true,  created_at: "2024-01-10T00:00:00Z", updated_at: "2024-01-10T00:00:00Z" },
  { id: "t4", organization_id: "org-amicolola", full_name: "Sofia Reyes",    avatar_url: null, role: "technician", phone: "706-265-0104", is_available: false, created_at: "2024-01-10T00:00:00Z", updated_at: "2024-01-10T00:00:00Z" },
  { id: "t5", organization_id: "org-amicolola", full_name: "Chen Wei",       avatar_url: null, role: "technician", phone: "706-265-0105", is_available: true,  created_at: "2024-01-10T00:00:00Z", updated_at: "2024-01-10T00:00:00Z" },
  { id: "m1", organization_id: "org-amicolola", full_name: "Sarah Mitchell", avatar_url: null, role: "manager",    phone: "706-265-0200", is_available: true,  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

// ─── Buildings ────────────────────────────────────────────────────────────────
export const MOCK_BUILDINGS: Building[] = [
  {
    id: "b1", organization_id: "org-amicolola",
    name: "Grandview Lodge",
    address: "1 Lakeshore Drive", city: "Lake Haven", state: "GA",
    type: "hotel", image_url: null,
    created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
    _floor_count: 3, _space_count: 57, _issue_count: 7,
  },
  {
    id: "b2", organization_id: "org-amicolola",
    name: "Pine Ridge Cabins",
    address: "1 Lakeshore Drive", city: "Lake Haven", state: "GA",
    type: "hotel", image_url: null,
    created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z",
    _floor_count: 1, _space_count: 14, _issue_count: 2,
  },
  {
    id: "b3", organization_id: "org-amicolola",
    name: "Recreation Center",
    address: "1 Lakeshore Drive", city: "Lake Haven", state: "GA",
    type: "hotel", image_url: null,
    created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z",
    _floor_count: 1, _space_count: 18, _issue_count: 1,
  },
];

// ─── Floors ───────────────────────────────────────────────────────────────────
export const MOCK_FLOORS: Floor[] = [
  { id: "f1", building_id: "b1", name: "Ground Floor",  level: 1, grid_cols: 14, grid_rows: 7, created_at: "2024-01-01T00:00:00Z" },
  { id: "f2", building_id: "b1", name: "Floor 2",       level: 2, grid_cols: 14, grid_rows: 7, created_at: "2024-01-01T00:00:00Z" },
  { id: "f3", building_id: "b1", name: "Floor 3",       level: 3, grid_cols: 14, grid_rows: 7, created_at: "2024-01-01T00:00:00Z" },
  { id: "f4", building_id: "b2", name: "Cabin Grounds", level: 1, grid_cols: 12, grid_rows: 6, created_at: "2024-01-02T00:00:00Z" },
  { id: "f5", building_id: "b3", name: "Main Level",    level: 1, grid_cols: 12, grid_rows: 6, created_at: "2024-01-03T00:00:00Z" },
];

// ─── Spaces — Lodge Ground Floor ─────────────────────────────────────────────
export const AMICOLOLA_SPACES: Space[] = [
  // ── Ground Floor ──────────────────────────────────────────────────────────
  // Lobby / Front of house
  { id: "s-lobby",     floor_id: "f1", name: "Main Lobby",        type: "lobby",       status: "operational",      position_x: 1,  position_y: 1, width: 3, height: 3, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-checkin",   floor_id: "f1", name: "Front Desk",        type: "office",      status: "operational",      position_x: 4,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-concierge", floor_id: "f1", name: "Concierge",         type: "office",      status: "operational",      position_x: 6,  position_y: 1, width: 2, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-giftshop",  floor_id: "f1", name: "Gift Shop",         type: "retail",      status: "operational",      position_x: 8,  position_y: 1, width: 2, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-atm",       floor_id: "f1", name: "ATM / Business Ctr",type: "utility",     status: "needs_maintenance",position_x: 10, position_y: 1, width: 2, height: 1, qr_code: null, notes: "ATM out of cash — service call placed", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-elevator1", floor_id: "f1", name: "Elevator Bank",     type: "elevator",    status: "operational",      position_x: 12, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  // Dining
  { id: "s-restaurant",floor_id: "f1", name: "Maple St. Grille",  type: "restaurant",  status: "operational",      position_x: 1,  position_y: 4, width: 4, height: 3, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-kitchen",   floor_id: "f1", name: "Kitchen",           type: "kitchen",     status: "inspection_due",   position_x: 5,  position_y: 4, width: 2, height: 2, qr_code: null, notes: "Monthly health inspection due this week", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-bar",       floor_id: "f1", name: "Terrace Bar",       type: "bar",         status: "operational",      position_x: 6,  position_y: 2, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  // Back of house
  { id: "s-hskp-gnd",  floor_id: "f1", name: "Housekeeping Office",type: "housekeeping",status: "operational",     position_x: 7,  position_y: 4, width: 2, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-maint",     floor_id: "f1", name: "Maintenance Shop",  type: "maintenance", status: "operational",      position_x: 7,  position_y: 5, width: 2, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-mechanical",floor_id: "f1", name: "Mechanical Room",   type: "mechanical",  status: "needs_maintenance",position_x: 9,  position_y: 4, width: 2, height: 2, qr_code: null, notes: "HVAC unit 2 showing intermittent fault codes", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-loading",   floor_id: "f1", name: "Loading Dock",      type: "loading",     status: "operational",      position_x: 11, position_y: 4, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-laundry",   floor_id: "f1", name: "Laundry",           type: "utility",     status: "operational",      position_x: 13, position_y: 4, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-rest-m-1",  floor_id: "f1", name: "Restroom M",        type: "restroom",    status: "operational",      position_x: 5,  position_y: 6, width: 1, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-rest-f-1",  floor_id: "f1", name: "Restroom F",        type: "restroom",    status: "cleaning_required",position_x: 6,  position_y: 6, width: 1, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },

  // ── Floor 2 — Guest Rooms ─────────────────────────────────────────────────
  { id: "s-201", floor_id: "f2", name: "Room 201",  type: "guest_room", status: "operational",      position_x: 1,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-202", floor_id: "f2", name: "Room 202",  type: "guest_room", status: "cleaning_required",position_x: 3,  position_y: 1, width: 2, height: 2, qr_code: null, notes: "Checked out 11am — needs full turnover", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-203", floor_id: "f2", name: "Room 203",  type: "guest_room", status: "operational",      position_x: 5,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-204", floor_id: "f2", name: "Room 204",  type: "guest_room", status: "needs_maintenance",position_x: 7,  position_y: 1, width: 2, height: 2, qr_code: null, notes: "Guest reported AC not cooling adequately", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-205", floor_id: "f2", name: "Room 205",  type: "guest_room", status: "operational",      position_x: 9,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-206", floor_id: "f2", name: "Room 206",  type: "guest_room", status: "cleaning_required",position_x: 11, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-207", floor_id: "f2", name: "Room 207",  type: "guest_room", status: "operational",      position_x: 13, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-208", floor_id: "f2", name: "Room 208",  type: "guest_room", status: "operational",      position_x: 1,  position_y: 3, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-209", floor_id: "f2", name: "Room 209",  type: "guest_room", status: "offline",          position_x: 3,  position_y: 3, width: 2, height: 2, qr_code: null, notes: "Out of service — bathroom renovation in progress", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-210", floor_id: "f2", name: "Room 210",  type: "guest_room", status: "operational",      position_x: 5,  position_y: 3, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-211", floor_id: "f2", name: "Room 211",  type: "guest_room", status: "operational",      position_x: 7,  position_y: 3, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-212", floor_id: "f2", name: "Room 212",  type: "guest_room", status: "inspection_due",   position_x: 9,  position_y: 3, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-213", floor_id: "f2", name: "Room 213",  type: "guest_room", status: "operational",      position_x: 11, position_y: 3, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-214", floor_id: "f2", name: "Falls Suite",type: "suite",     status: "operational",      position_x: 13, position_y: 3, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-hskp-2",floor_id: "f2", name: "Housekeeping Closet",type: "housekeeping", status: "operational", position_x: 7, position_y: 5, width: 1, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-ice-2", floor_id: "f2", name: "Ice / Vending",      type: "utility",     status: "operational", position_x: 8, position_y: 5, width: 1, height: 1, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },

  // ── Floor 3 — Conference & Premium ───────────────────────────────────────
  { id: "s-301", floor_id: "f3", name: "Room 301",   type: "guest_room", status: "operational",      position_x: 1,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-302", floor_id: "f3", name: "Room 302",   type: "guest_room", status: "operational",      position_x: 3,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-303", floor_id: "f3", name: "Room 303",   type: "guest_room", status: "cleaning_required",position_x: 5,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-304", floor_id: "f3", name: "Room 304",   type: "guest_room", status: "operational",      position_x: 7,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-305", floor_id: "f3", name: "Room 305",   type: "guest_room", status: "operational",      position_x: 9,  position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-306", floor_id: "f3", name: "Room 306",   type: "guest_room", status: "emergency",        position_x: 11, position_y: 1, width: 2, height: 2, qr_code: null, notes: "Burst pipe under sink — water shut off to room", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-307", floor_id: "f3", name: "Summit Suite",type: "suite",     status: "operational",      position_x: 13, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-conf-a",floor_id: "f3", name: "Blue Ridge Conf. Room", type: "conference", status: "operational", position_x: 1, position_y: 3, width: 4, height: 3, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-conf-b",floor_id: "f3", name: "Dahlonega Boardroom",   type: "conference", status: "operational", position_x: 5, position_y: 3, width: 3, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-fitness",floor_id: "f3", name: "Fitness Center",        type: "fitness",   status: "operational", position_x: 8, position_y: 3, width: 3, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s-spa",   floor_id: "f3", name: "Appalachian Spa",        type: "spa",       status: "operational", position_x: 11, position_y: 3, width: 4, height: 2, qr_code: null, notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },

  // ── Pine Ridge Cabins ──────────────────────────────────────────────────
  { id: "s-c1", floor_id: "f4", name: "Cabin 1 — Bear Creek",  type: "cabin", status: "operational",      position_x: 1, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
  { id: "s-c2", floor_id: "f4", name: "Cabin 2 — Deer Run",    type: "cabin", status: "cleaning_required",position_x: 4, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
  { id: "s-c3", floor_id: "f4", name: "Cabin 3 — Eagle Ridge", type: "cabin", status: "operational",      position_x: 7, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
  { id: "s-c4", floor_id: "f4", name: "Cabin 4 — Fox Hollow",  type: "cabin", status: "operational",      position_x: 10, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
  { id: "s-c5", floor_id: "f4", name: "Cabin 5 — Hawk Nest",   type: "cabin", status: "needs_maintenance",position_x: 1, position_y: 4, width: 2, height: 2, qr_code: null, notes: "Deck boards rotting — trip hazard", created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
  { id: "s-c6", floor_id: "f4", name: "Cabin 6 — Ironwood",    type: "cabin", status: "operational",      position_x: 4, position_y: 4, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
  { id: "s-c7", floor_id: "f4", name: "Cabin 7 — Juniper",     type: "cabin", status: "operational",      position_x: 7, position_y: 4, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
  { id: "s-c8", floor_id: "f4", name: "Cabin 8 — Kudzu Knoll", type: "cabin", status: "offline",          position_x: 10, position_y: 4, width: 2, height: 2, qr_code: null, notes: "Storm damage — awaiting insurance adjuster", created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },

  // ── Guest Services ────────────────────────────────────────────────────────
  { id: "s-pool",    floor_id: "f5", name: "Outdoor Pool",      type: "pool",        status: "operational",      position_x: 1, position_y: 1, width: 3, height: 3, qr_code: null, notes: null, created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z" },
  { id: "s-trailhd", floor_id: "f5", name: "Trail Head Office", type: "office",      status: "operational",      position_x: 4, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z" },
  { id: "s-attrail", floor_id: "f5", name: "Pine Ridge Trail", type: "trail",       status: "inspection_due",   position_x: 6, position_y: 1, width: 2, height: 2, qr_code: null, notes: "Seasonal inspection before heavy traffic season", created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z" },
  { id: "s-visitctr",floor_id: "f5", name: "Visitor Center",    type: "lobby",       status: "operational",      position_x: 8, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z" },
  { id: "s-picnic",  floor_id: "f5", name: "Picnic Pavilion",   type: "outdoor",     status: "operational",      position_x: 10, position_y: 1, width: 2, height: 2, qr_code: null, notes: null, created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z" },
];

// ─── Work Orders ──────────────────────────────────────────────────────────────
export const AMICOLOLA_WORK_ORDERS: WorkOrder[] = [
  {
    id: "wo-1", organization_id: "org-amicolola", space_id: "s-306", asset_id: null,
    created_by: "m1", assigned_to: "t1",
    title: "Burst Pipe — Room 306",
    description: "Guest reported water on bathroom floor. Pipe under sink has failed. Water to room is shut off. Guest relocated to Room 308.",
    status: "in_progress", priority: "critical", category: "plumbing",
    photos: [], due_date: new Date().toISOString(), completed_at: null,
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60000).toISOString(),
    assignee: MOCK_PROFILES[0], creator: MOCK_PROFILES[5], _comment_count: 3,
  },
  {
    id: "wo-2", organization_id: "org-amicolola", space_id: "s-204", asset_id: null,
    created_by: "m1", assigned_to: "t2",
    title: "AC Not Cooling — Room 204",
    description: "Guest called front desk reporting room not reaching set temperature. Thermostat showing 78°F despite 68°F setting.",
    status: "assigned", priority: "high", category: "hvac",
    photos: [], due_date: null, completed_at: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    assignee: MOCK_PROFILES[1], creator: MOCK_PROFILES[5], _comment_count: 1,
  },
  {
    id: "wo-3", organization_id: "org-amicolola", space_id: "s-mechanical", asset_id: null,
    created_by: "t3", assigned_to: "t3",
    title: "HVAC Unit 2 Fault Code — Mechanical Room",
    description: "BAS showing fault code E-14 on HVAC unit 2. Unit cycling on and off. Running diagnostics. May need capacitor replacement.",
    status: "in_progress", priority: "high", category: "hvac",
    photos: [], due_date: null, completed_at: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    assignee: MOCK_PROFILES[2], creator: MOCK_PROFILES[2], _comment_count: 2,
  },
  {
    id: "wo-4", organization_id: "org-amicolola", space_id: "s-c5", asset_id: null,
    created_by: "m1", assigned_to: "t4",
    title: "Deck Boards Rotting — Cabin 5",
    description: "Multiple deck boards showing significant rot. Two boards are cracked through — trip hazard. Cabin blocked for new bookings until repaired.",
    status: "waiting_parts", priority: "high", category: "carpentry",
    photos: [], due_date: null, completed_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    assignee: MOCK_PROFILES[3], creator: MOCK_PROFILES[5], _comment_count: 2,
  },
  {
    id: "wo-5", organization_id: "org-amicolola", space_id: "s-kitchen", asset_id: null,
    created_by: "m1", assigned_to: null,
    title: "Monthly Health Inspection — Maple St. Grille Kitchen",
    description: "Monthly food service inspection due this week. All equipment, storage, and prep surfaces need to be inspection-ready.",
    status: "open", priority: "medium", category: "inspection",
    photos: [], due_date: new Date(Date.now() + 4 * 86400000).toISOString(), completed_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    assignee: undefined, creator: MOCK_PROFILES[5], _comment_count: 0,
  },
  {
    id: "wo-6", organization_id: "org-amicolola", space_id: "s-attrail", asset_id: null,
    created_by: "m1", assigned_to: "t5",
    title: "Pre-Season Trail Inspection — Pine Ridge Trail",
    description: "Annual spring inspection before peak hiking season. Check all signage, water bars, blowdowns, and footbridge stability over the creek.",
    status: "open", priority: "medium", category: "grounds",
    photos: [], due_date: new Date(Date.now() + 7 * 86400000).toISOString(), completed_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    assignee: MOCK_PROFILES[4], creator: MOCK_PROFILES[5], _comment_count: 0,
  },
  {
    id: "wo-7", organization_id: "org-amicolola", space_id: "s-atm", asset_id: null,
    created_by: "t5", assigned_to: "t5",
    title: "ATM Out of Cash — Business Center",
    description: "ATM machine empty. Armored car service called — ETA 48 hours. Sign placed on machine.",
    status: "waiting_parts", priority: "low", category: "other",
    photos: [], due_date: null, completed_at: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    assignee: MOCK_PROFILES[4], creator: MOCK_PROFILES[4], _comment_count: 0,
  },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const MOCK_STATS: DashboardStats = {
  active_issues: 7,
  operational_percent: 84,
  technicians_online: 5,
  critical_alerts: 1,
  completed_today: 4,
  avg_resolution_hours: 3.8,
};

// ─── Activity Feed ────────────────────────────────────────────────────────────
export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "work_order_created",  title: "Emergency issue created",  description: "Burst pipe in Room 306 — guest relocated",            user: { name: "Sarah Mitchell" }, timestamp: new Date(Date.now() - 90 * 60000).toISOString(), meta: { priority: "critical" } },
  { id: "a2", type: "tech_assigned",       title: "Technician dispatched",    description: "Marcus Webb assigned to Room 306 plumbing emergency",  user: { name: "Sarah Mitchell" }, timestamp: new Date(Date.now() - 85 * 60000).toISOString() },
  { id: "a3", type: "status_changed",      title: "Room status changed",      description: "Room 202 marked Cleaning Required via RoomMaster sync", user: { name: "RoomMaster Sync" }, timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: "a4", type: "comment_added",       title: "Update on Room 306",       description: "Marcus Webb: pipe isolated, drywall assessment next",   user: { name: "Marcus Webb" },    timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: "a5", type: "work_order_created",  title: "New work order",           description: "AC complaint filed for Room 204",                      user: { name: "Front Desk" },     timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "a6", type: "status_changed",      title: "Cabin marked offline",     description: "Cabin 8 set Offline — storm damage assessment",        user: { name: "Sarah Mitchell" }, timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: "a7", type: "work_order_updated",  title: "Work order completed",     description: "Pool chemical balance inspection passed — all clear",   user: { name: "Chen Wei" },       timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
];

// ─── Trend data ───────────────────────────────────────────────────────────────
export const MOCK_TREND_DATA = [
  { day: "Mon", opened: 5, closed: 4, critical: 0 },
  { day: "Tue", opened: 8, closed: 6, critical: 1 },
  { day: "Wed", opened: 4, closed: 7, critical: 0 },
  { day: "Thu", opened: 10, closed: 5, critical: 2 },
  { day: "Fri", opened: 7, closed: 9, critical: 1 },
  { day: "Sat", opened: 6, closed: 8, critical: 0 },
  { day: "Sun", opened: 9, closed: 6, critical: 1 },
];

// Legacy aliases
export const MOCK_SPACES = AMICOLOLA_SPACES;
export const MOCK_WORK_ORDERS = AMICOLOLA_WORK_ORDERS;
