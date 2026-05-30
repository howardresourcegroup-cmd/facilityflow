"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createBuilding } from "@/lib/data/queries";

interface CreateBuildingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export interface BuildingFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  type: string;
}

const BUILDING_TYPES = [
  { value: "office",    label: "Office / Corporate" },
  { value: "hospital",  label: "Hospital / Medical" },
  { value: "school",    label: "School / University" },
  { value: "hotel",     label: "Hotel / Hospitality" },
  { value: "retail",    label: "Retail / Shopping" },
  { value: "warehouse", label: "Warehouse / Industrial" },
  { value: "apartment", label: "Apartment Complex" },
  { value: "other",     label: "Other" },
];

export function CreateBuildingModal({ open, onClose, onCreated }: CreateBuildingModalProps) {
  const [form, setForm] = useState<BuildingFormData>({
    name: "", address: "", city: "", state: "", type: "office",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof BuildingFormData) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createBuilding(form);
      onCreated?.();
      onClose();
      setForm({ name: "", address: "", city: "", state: "", type: "office" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create building");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
              <Building2 className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <DialogTitle>Add Building</DialogTitle>
              <DialogDescription>Register a new facility to monitor.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bname">Building Name *</Label>
              <Input
                id="bname"
                placeholder="Westfield Corporate Tower"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Building Type</Label>
              <Select value={form.type} onValueChange={set("type")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUILDING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="1200 Peachtree St NE"
                value={form.address}
                onChange={(e) => set("address")(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Atlanta"
                  value={form.city}
                  onChange={(e) => set("city")(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="GA"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => set("state")(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mx-6 mb-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? "Creating…" : "Create Building"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
