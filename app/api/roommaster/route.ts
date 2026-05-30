export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import type { SpaceStatus } from "@/types";

// ─── RoomMaster status mapping ─────────────────────────────────────────────
// RoomMaster by IQware housekeeping status codes
const RM_STATUS_MAP: Record<string, { ff_status: SpaceStatus; create_wo: boolean }> = {
  "1": { ff_status: "operational",       create_wo: false }, // Clean
  "2": { ff_status: "cleaning_required", create_wo: true  }, // Dirty
  "3": { ff_status: "operational",       create_wo: false }, // Inspected
  "4": { ff_status: "offline",           create_wo: true  }, // Out of Service
  "5": { ff_status: "operational",       create_wo: false }, // Do Not Disturb (occupied)
  "6": { ff_status: "cleaning_required", create_wo: true  }, // Occupied Dirty
  "7": { ff_status: "operational",       create_wo: false }, // Occupied Clean
  "8": { ff_status: "inspection_due",    create_wo: true  }, // Pickup (light clean needed)
  "9": { ff_status: "needs_maintenance", create_wo: true  }, // Maintenance
};

// ─── Mock RoomMaster response ─────────────────────────────────────────────
// Simulates a RoomMaster HTTP API / XML export response
// In production: replace this with a real HTTP call to RoomMaster's API endpoint
const MOCK_RM_ROOMS = [
  { room: "201", rm_status: "7", rm_label: "Occupied Clean",   space_id: "s-201" },
  { room: "202", rm_status: "6", rm_label: "Occupied Dirty",   space_id: "s-202" },
  { room: "203", rm_status: "3", rm_label: "Inspected",        space_id: "s-203" },
  { room: "204", rm_status: "9", rm_label: "Maintenance",      space_id: "s-204" },
  { room: "205", rm_status: "7", rm_label: "Occupied Clean",   space_id: "s-205" },
  { room: "206", rm_status: "2", rm_label: "Dirty",            space_id: "s-206" },
  { room: "207", rm_status: "1", rm_label: "Clean",            space_id: "s-207" },
  { room: "208", rm_status: "7", rm_label: "Occupied Clean",   space_id: "s-208" },
  { room: "209", rm_status: "4", rm_label: "Out of Service",   space_id: "s-209" },
  { room: "210", rm_status: "1", rm_label: "Clean",            space_id: "s-210" },
  { room: "211", rm_status: "8", rm_label: "Pickup",           space_id: "s-211" },
  { room: "212", rm_status: "8", rm_label: "Pickup",           space_id: "s-212" },
  { room: "213", rm_status: "1", rm_label: "Clean",            space_id: "s-213" },
  { room: "214", rm_status: "5", rm_label: "Do Not Disturb",   space_id: "s-214" }, // Falls Suite
  { room: "301", rm_status: "1", rm_label: "Clean",            space_id: "s-301" },
  { room: "302", rm_status: "7", rm_label: "Occupied Clean",   space_id: "s-302" },
  { room: "303", rm_status: "2", rm_label: "Dirty",            space_id: "s-303" },
  { room: "304", rm_status: "7", rm_label: "Occupied Clean",   space_id: "s-304" },
  { room: "305", rm_status: "1", rm_label: "Clean",            space_id: "s-305" },
  { room: "306", rm_status: "4", rm_label: "Out of Service",   space_id: "s-306" },
  { room: "307", rm_status: "5", rm_label: "Do Not Disturb",   space_id: "s-307" }, // Summit Suite
];

// GET /api/roommaster — fetch current room statuses from RoomMaster
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";

  const rooms = MOCK_RM_ROOMS.map((r) => {
    const mapping = RM_STATUS_MAP[r.rm_status] ?? { ff_status: "operational" as SpaceStatus, create_wo: false };
    return {
      room_number: r.room,
      pms_status: r.rm_label,
      pms_status_code: r.rm_status,
      ff_status: mapping.ff_status,
      space_id: r.space_id,
      space_name: `Room ${r.room}`,
      create_work_order: mapping.create_wo,
    };
  });

  if (format === "xml") {
    // Simulate RoomMaster XML format for clients that need it
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RoomMasterExport timestamp="${new Date().toISOString()}" property="AMICALOLA">
  <Rooms>
${rooms.map((r) => `    <Room number="${r.room_number}" status="${r.pms_status_code}" statusLabel="${r.pms_status}" />`).join("\n")}
  </Rooms>
</RoomMasterExport>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  return NextResponse.json({
    provider: "RoomMaster by IQware",
    property_code: "AMICALOLA",
    synced_at: new Date().toISOString(),
    total_rooms: rooms.length,
    rooms,
  });
}

// POST /api/roommaster — receive a webhook from RoomMaster when a room status changes
// Also used by the "Sync Now" button to trigger a full pull
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "sync";

  if (action === "webhook") {
    // Single-room webhook from RoomMaster
    const { room_number, status_code, status_label } = body as {
      room_number?: string;
      status_code?: string;
      status_label?: string;
    };

    if (!room_number || !status_code) {
      return NextResponse.json({ error: "Missing room_number or status_code" }, { status: 400 });
    }

    const rm = MOCK_RM_ROOMS.find((r) => r.room === room_number);
    const mapping = RM_STATUS_MAP[status_code] ?? { ff_status: "operational" as SpaceStatus, create_wo: false };

    return NextResponse.json({
      received: true,
      room_number,
      pms_status: status_label ?? status_code,
      ff_status: mapping.ff_status,
      space_id: rm?.space_id ?? null,
      create_work_order: mapping.create_wo,
      processed_at: new Date().toISOString(),
    });
  }

  // Full sync — return all rooms with changes to apply
  const rooms = MOCK_RM_ROOMS.map((r) => {
    const mapping = RM_STATUS_MAP[r.rm_status] ?? { ff_status: "operational" as SpaceStatus, create_wo: false };
    return {
      room_number: r.room,
      pms_status: r.rm_label,
      ff_status: mapping.ff_status,
      space_id: r.space_id,
      space_name: `Room ${r.room}`,
      create_work_order: mapping.create_wo,
    };
  });

  const changesCount = rooms.filter((r) => r.create_work_order).length;

  return NextResponse.json({
    success: true,
    synced_at: new Date().toISOString(),
    total_rooms: rooms.length,
    changes: rooms,
    work_orders_created: changesCount,
  });
}
