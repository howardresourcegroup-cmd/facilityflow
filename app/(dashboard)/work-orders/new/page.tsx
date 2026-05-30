"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/lib/store/data-store";
import { MOCK_PROFILES } from "@/lib/mock-data";
import type { WorkOrderPriority } from "@/types";

const CATEGORIES = [
  "General", "HVAC", "Plumbing", "Electrical", "Network / IT",
  "Elevator", "Housekeeping", "Grounds", "Carpentry", "Inspection", "Other",
];

export default function NewWorkOrderPage() {
  const router = useRouter();
  const { addWorkOrder } = useDataStore();
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium" as WorkOrderPriority,
    category: "General", location: "", assigned_to: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const assignee = MOCK_PROFILES.find((p) =>
      p.full_name.toLowerCase().includes(form.assigned_to.toLowerCase())
    );

    addWorkOrder({
      id: `wo-${Date.now()}`,
      organization_id: "org-amicolola",
      space_id: null,
      asset_id: null,
      created_by: "m1",
      assigned_to: assignee?.id ?? null,
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: assignee ? "assigned" : "open",
      priority: form.priority,
      category: form.category.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_"),
      photos: [],
      due_date: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignee,
      creator: MOCK_PROFILES[5],
      _comment_count: 0,
    });

    setSaving(false);
    router.push("/work-orders");
  };

  const pColor: Record<WorkOrderPriority, string> = {
    low: "text-zinc-400", medium: "text-blue-400", high: "text-orange-400", critical: "text-red-400",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
          <ClipboardList className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">New Work Order</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Document an issue and dispatch your team.</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="e.g. AC not cooling in Room 204"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              required className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="What did you observe? Guest complaint? Equipment reading? More detail = faster resolution."
              rows={4}
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority")(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high", "critical"] as WorkOrderPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className={pColor[p] + " font-medium capitalize"}>{p}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={set("category")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Room 204, Cabin 3, Kitchen, Trail Head…"
              value={form.location}
              onChange={(e) => set("location")(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assign">Assign To (optional)</Label>
            <Input
              id="assign"
              placeholder="Technician name"
              value={form.assigned_to}
              onChange={(e) => set("assigned_to")(e.target.value)}
              list="tech-list"
            />
            <datalist id="tech-list">
              {MOCK_PROFILES.map((p) => <option key={p.id} value={p.full_name} />)}
            </datalist>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving || !form.title.trim()} size="lg">
              <ClipboardList className="h-4 w-4" />
              {saving ? "Creating…" : "Create Work Order"}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
