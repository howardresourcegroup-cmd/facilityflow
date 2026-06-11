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
import type { WorkOrderPriority } from "@/types";

interface WorkOrderFormData {
  title: string;
  description: string;
  priority: WorkOrderPriority;
  category: string;
  space_id: string;
  assigned_to: string;
}

const CATEGORIES = [
  "General", "HVAC", "Plumbing", "Electrical", "Network / IT",
  "Elevator", "Cleaning", "Security", "Inspection", "Other",
];

const PRIORITIES: { value: WorkOrderPriority; label: string; desc: string }[] = [
  { value: "low",      label: "Low",      desc: "No urgency, schedule when convenient" },
  { value: "medium",   label: "Medium",   desc: "Address within a few days" },
  { value: "high",     label: "High",     desc: "Needs attention today" },
  { value: "critical", label: "Critical", desc: "Immediate action required" },
];

export function WorkOrderForm() {
  const router = useRouter();
  const [form, setForm] = useState<WorkOrderFormData>({
    title: "", description: "", priority: "medium",
    category: "General", space_id: "", assigned_to: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof WorkOrderFormData) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    router.push("/work-orders");
  };

  const pCfg = {
    low: "text-muted-foreground", medium: "text-blue-400", high: "text-orange-400", critical: "text-red-400",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="wo-title">Issue Title *</Label>
        <Input
          id="wo-title"
          placeholder="e.g. HVAC unit not cooling in Room 301"
          value={form.title}
          onChange={(e) => set("title")(e.target.value)}
          required
          className="text-base h-10"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="wo-desc">Description</Label>
        <Textarea
          id="wo-desc"
          placeholder="Describe the issue in detail — what you see, heard, or measured. More context speeds up resolution."
          rows={4}
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
        />
      </div>

      {/* Priority + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Priority *</Label>
          <Select value={form.priority} onValueChange={(v) => set("priority")(v as WorkOrderPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <span className={cn("font-medium", pCfg[p.value as WorkOrderPriority])}>{p.label}</span>
                  <span className="text-muted-foreground ml-1.5 text-[11px]">— {p.desc}</span>
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
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_")}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Space */}
      <div className="space-y-1.5">
        <Label htmlFor="wo-space">Location (optional)</Label>
        <Input
          id="wo-space"
          placeholder="Room or space name (e.g. Server Room, Lobby, Room 204)"
          value={form.space_id}
          onChange={(e) => set("space_id")(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Link to a specific room on the floorplan.</p>
      </div>

      {/* Assign */}
      <div className="space-y-1.5">
        <Label htmlFor="wo-assign">Assign To (optional)</Label>
        <Input
          id="wo-assign"
          placeholder="Technician name or leave blank to assign later"
          value={form.assigned_to}
          onChange={(e) => set("assigned_to")(e.target.value)}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving || !form.title.trim()} size="lg">
          <ClipboardList className="h-4 w-4" />
          {saving ? "Creating…" : "Create Work Order"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// re-export cn for use in this file
function cn(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(" ");
}
