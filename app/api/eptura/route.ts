export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/server/auth";
import type { WorkOrderStatus, WorkOrderPriority } from "@/types";

// ─── Eptura Asset (CMMS) ↔ FacilityFlow mapping ───────────────────────────────
// Eptura Asset (formerly ManagerPlus / Hippo CMMS) work-order statuses.
// Bidirectional: pull Eptura work orders in, push FacilityFlow updates out.

const EPTURA_TO_FF_STATUS: Record<string, WorkOrderStatus> = {
  "New":          "open",
  "Assigned":     "assigned",
  "In Progress":  "in_progress",
  "On Hold":      "waiting_parts",
  "Waiting":      "waiting_parts",
  "Completed":    "completed",
  "Closed":       "completed",
  "Cancelled":    "cancelled",
};

const FF_TO_EPTURA_STATUS: Record<WorkOrderStatus, string> = {
  open:          "New",
  assigned:      "Assigned",
  in_progress:   "In Progress",
  waiting_parts: "On Hold",
  completed:     "Completed",
  cancelled:     "Cancelled",
};

const EPTURA_TO_FF_PRIORITY: Record<string, WorkOrderPriority> = {
  "Low":      "low",
  "Medium":   "medium",
  "Normal":   "medium",
  "High":     "high",
  "Urgent":   "critical",
  "Critical": "critical",
};

// ─── Mock Eptura work orders ──────────────────────────────────────────────────
// In production: replace with a real call to Eptura's REST API:
//   GET https://api.eptura.com/v1/workorders?status=open
//   Authorization: Bearer <EPTURA_API_TOKEN>
const MOCK_EPTURA_WORKORDERS = [
  { id: "EPT-4471", title: "Replace HVAC air filter — Mechanical Room", asset: "HVAC Unit 2", status: "In Progress", priority: "High",   assigned: "Marcus Webb",  space_id: "s-mechanical" },
  { id: "EPT-4468", title: "Quarterly elevator inspection",            asset: "Elevator Unit 1", status: "New",        priority: "Medium", assigned: null,           space_id: "s-elevator1" },
  { id: "EPT-4465", title: "Boiler pressure relief valve service",     asset: "Domestic Boiler", status: "On Hold",    priority: "High",   assigned: "James Okafor", space_id: "s-mechanical" },
  { id: "EPT-4460", title: "Pool pump seal replacement",               asset: "Pool Pump Main",  status: "Completed",  priority: "Normal", assigned: "Chen Wei",     space_id: "s-pool" },
  { id: "EPT-4459", title: "Generator monthly load test",              asset: "Backup Generator",status: "New",        priority: "Medium", assigned: null,           space_id: "s-mechanical" },
];

// ─── Mock Eptura asset registry ───────────────────────────────────────────────
const MOCK_EPTURA_ASSETS = [
  { id: "AST-001", name: "HVAC Unit 2",        category: "HVAC",       status: "Needs Service", next_pm: "2026-06-01", space_id: "s-mechanical" },
  { id: "AST-014", name: "Domestic Boiler",    category: "Plumbing",   status: "Degraded",      next_pm: "2026-05-05", space_id: "s-mechanical" },
  { id: "AST-022", name: "Elevator Unit 1",    category: "Elevator",   status: "Operational",   next_pm: "2026-08-28", space_id: "s-elevator1" },
  { id: "AST-031", name: "Pool Pump Main",     category: "Pool",       status: "Operational",   next_pm: "2026-10-01", space_id: "s-pool" },
  { id: "AST-040", name: "Backup Generator",   category: "Electrical", status: "Operational",   next_pm: "2026-07-15", space_id: "s-mechanical" },
];

// GET — pull work orders + assets from Eptura
export async function GET(request: NextRequest) {
  if (!(await getAuthedUser(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") ?? "workorders";

  if (resource === "assets") {
    return NextResponse.json({
      provider: "Eptura Asset",
      synced_at: new Date().toISOString(),
      total: MOCK_EPTURA_ASSETS.length,
      assets: MOCK_EPTURA_ASSETS,
    });
  }

  const workorders = MOCK_EPTURA_WORKORDERS.map((wo) => ({
    eptura_id: wo.id,
    title: wo.title,
    asset: wo.asset,
    space_id: wo.space_id,
    assigned_to: wo.assigned,
    eptura_status: wo.status,
    ff_status: EPTURA_TO_FF_STATUS[wo.status] ?? "open",
    eptura_priority: wo.priority,
    ff_priority: EPTURA_TO_FF_PRIORITY[wo.priority] ?? "medium",
  }));

  return NextResponse.json({
    provider: "Eptura Asset",
    property_code: "AMICALOLA",
    synced_at: new Date().toISOString(),
    total_work_orders: workorders.length,
    work_orders: workorders,
  });
}

// POST — sync (pull) or push a FacilityFlow work-order update back to Eptura
export async function POST(request: NextRequest) {
  if (!(await getAuthedUser(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "sync";
  const body = await request.json().catch(() => ({}));

  // ── Push: FacilityFlow → Eptura ───────────────────────────────────────────
  // Called when a work order's status changes in FacilityFlow.
  // In production:
  //   PATCH https://api.eptura.com/v1/workorders/{id}
  //   Authorization: Bearer <EPTURA_API_TOKEN>
  //   Body: { "status": "In Progress" }
  if (action === "push") {
    const { eptura_id, ff_status } = body as { eptura_id?: string; ff_status?: WorkOrderStatus };
    if (!eptura_id || !ff_status) {
      return NextResponse.json({ error: "eptura_id and ff_status required" }, { status: 400 });
    }
    return NextResponse.json({
      pushed: true,
      eptura_id,
      ff_status,
      eptura_status: FF_TO_EPTURA_STATUS[ff_status] ?? "New",
      pushed_at: new Date().toISOString(),
    });
  }

  // ── Full sync pull ────────────────────────────────────────────────────────
  const workorders = MOCK_EPTURA_WORKORDERS.map((wo) => ({
    eptura_id: wo.id,
    title: wo.title,
    asset: wo.asset,
    space_id: wo.space_id,
    assigned_to: wo.assigned,
    ff_status: EPTURA_TO_FF_STATUS[wo.status] ?? "open",
    ff_priority: EPTURA_TO_FF_PRIORITY[wo.priority] ?? "medium",
    category: "maintenance",
  }));

  const importable = workorders.filter((w) => w.ff_status !== "completed" && w.ff_status !== "cancelled");

  return NextResponse.json({
    success: true,
    synced_at: new Date().toISOString(),
    total_work_orders: workorders.length,
    importable_count: importable.length,
    work_orders: workorders,
  });
}
