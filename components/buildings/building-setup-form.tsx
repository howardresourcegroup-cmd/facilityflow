"use client";

import { useState, useRef } from "react";
import { ArrowRight, Building2, Loader2, Sparkles, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { setupBuilding } from "@/lib/data/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ParsedProperty } from "@/app/api/ai/parse-property/route";

const TYPES = ["Hotel", "Lodge", "Resort", "Inn", "Other"];

interface Props {
  onDone: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  /** Show AI describe section expanded by default */
  aiFirst?: boolean;
}

export function BuildingSetupForm({ onDone, onCancel, submitLabel = "Create property", aiFirst = true }: Props) {
  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState("Hotel");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [floorRooms, setFloorRooms] = useState<number[]>([12, 12, 12]);
  const [floorLabels, setFloorLabels] = useState<string[]>(["Floor 1", "Floor 2", "Floor 3"]);

  // AI describe
  const [aiOpen, setAiOpen] = useState(aiFirst);
  const [description, setDescription] = useState("");
  const [parsing, setParsing] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiError, setAiError] = useState("");

  // Drag-to-reorder state
  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragEnter = (i: number) => { dragOverIdx.current = i; };
  const onDragEnd = () => {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) { dragIdx.current = null; dragOverIdx.current = null; return; }
    const reorder = <T,>(arr: T[]) => { const a = [...arr]; const [item] = a.splice(from, 1); a.splice(to, 0, item); return a; };
    setFloorRooms(reorder);
    setFloorLabels(reorder);
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  // Submit
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = floorRooms.reduce((a, b) => a + Math.max(0, b), 0);

  const setFloorCount = (n: number) => {
    const count = Math.max(1, Math.min(50, n || 1));
    setFloorRooms((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? prev[prev.length - 1] ?? 12));
    setFloorLabels((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? `Floor ${i + 1}`));
  };

  const setRoomsOn = (i: number, n: number) =>
    setFloorRooms((prev) => prev.map((v, idx) => (idx === i ? Math.max(0, Math.min(200, n || 0)) : v)));

  const setLabelOn = (i: number, v: string) =>
    setFloorLabels((prev) => prev.map((l, idx) => (idx === i ? v : l)));

  const applyParsed = (p: ParsedProperty) => {
    if (p.name) setName(p.name);
    setType(TYPES.find((t) => t.toLowerCase() === p.type) ?? "Hotel");
    if (p.city) setCity(p.city);
    if (p.state) setState(p.state);
    setFloorRooms(p.floors);
    setFloorLabels(p.floorLabels.length === p.floors.length ? p.floorLabels : p.floors.map((_, i) => `Floor ${i + 1}`));
    setAiNotes(p.notes ?? "");
    setAiOpen(false);
  };

  const parseDescription = async () => {
    if (!description.trim()) return;
    setParsing(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/parse-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Parse failed");
      const data: ParsedProperty = await res.json();
      applyParsed(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Couldn't parse — fill in manually below.");
    } finally {
      setParsing(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Give your property a name."); return; }
    setSaving(true);
    setError("");
    try {
      await setupBuilding({
        name: name.trim(), type: type.toLowerCase(), address: "", city: city.trim(), state: state.trim(),
        floors: floorRooms,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the building.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* AI describe */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] overflow-hidden">
        <button
          type="button"
          onClick={() => setAiOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-indigo-300 hover:bg-indigo-500/[0.06] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Describe your property — AI will configure it
          </span>
          {aiOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {aiOpen && (
          <div className="px-4 pb-4 space-y-3">
            <Textarea
              placeholder={`e.g. "5-floor mountain lodge called Ridgecrest Inn in Dahlonega GA. Ground floor has lobby and restaurant, floors 2-5 have 14 rooms each."`}
              className="min-h-[80px] text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) parseDescription(); }}
            />
            {aiError && <p className="text-xs text-red-400">{aiError}</p>}
            <Button
              type="button"
              size="sm"
              onClick={parseDescription}
              disabled={parsing || !description.trim()}
              className="w-full"
            >
              {parsing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing…</> : <><Sparkles className="h-3.5 w-3.5" /> Configure with AI</>}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">⌘↵ to submit · Review the config below before saving</p>
          </div>
        )}

        {aiNotes && !aiOpen && (
          <p className="px-4 pb-3 text-[11px] text-indigo-400/70 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 shrink-0" /> {aiNotes}
          </p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="bname">Property name *</Label>
        <Input id="bname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ridgecrest Inn" autoFocus={!aiFirst} />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                type === t ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300" : "border-border text-muted-foreground hover:border-white/20"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dahlonega" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder="GA" maxLength={2} />
        </div>
      </div>

      {/* Floor count */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="floors">Floors</Label>
          <span className="text-[11px] text-muted-foreground">Set rooms per floor — they can differ</span>
        </div>
        <Input id="floors" type="number" min={1} max={50} value={floorRooms.length}
          onChange={(e) => setFloorCount(+e.target.value)} />
      </div>

      {/* Per-floor editor — drag rows to reorder */}
      <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
        {floorRooms.map((rooms, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragEnter={() => onDragEnter(i)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-foreground/[0.03] cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              value={floorLabels[i] ?? `Floor ${i + 1}`}
              onChange={(e) => setLabelOn(i, e.target.value)}
              className="h-8 text-xs flex-1 min-w-0"
              placeholder={`Floor ${i + 1}`}
            />
            <Input
              type="number" min={0} max={200} value={rooms}
              onChange={(e) => setRoomsOn(i, +e.target.value)}
              className="h-8 w-20 shrink-0"
            />
            <span className="text-[11px] text-muted-foreground w-10 shrink-0">rooms</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-foreground/[0.03] border border-border rounded-lg px-3 py-2">
        <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        Creates <span className="text-foreground font-medium">{floorRooms.length} floors</span> and{" "}
        <span className="text-foreground font-medium">{total} guest rooms</span>{" "}
        {floorRooms.some((r) => r === 0) && <span className="text-muted-foreground">(floors with 0 rooms = common space)</span>}
      </div>

      {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        )}
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Building…</> : <>{submitLabel} <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </div>
    </form>
  );
}
