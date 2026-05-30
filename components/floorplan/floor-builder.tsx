"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Check, MousePointer2, Grid3x3, Sparkles } from "lucide-react";
import type { Floor, Space } from "@/types";
import { cn, SPACE_STATUS_CONFIG } from "@/lib/utils";
import { createSpace, deleteSpace } from "@/lib/data/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CELL = 48;
const GAP = 3;

const ROOM_TYPES = [
  "guest_room", "suite", "cabin", "lobby", "office", "restaurant", "kitchen",
  "bar", "conference", "restroom", "housekeeping", "maintenance", "mechanical",
  "pool", "spa", "fitness", "storage", "utility", "hallway", "elevator", "other",
];

interface Cell { x: number; y: number; }

interface FloorBuilderProps {
  floor: Floor;
  spaces: Space[];
  onAdd: (space: Space) => void;
  onRemove: (spaceId: string) => void;
  onDone: () => void;
}

export function FloorBuilder({ floor, spaces, onAdd, onRemove, onDone }: FloorBuilderProps) {
  const cols = floor.grid_cols;
  const rows = floor.grid_rows;
  const gridRef = useRef<HTMLDivElement>(null);

  const [dragStart, setDragStart] = useState<Cell | null>(null);
  const [dragEnd, setDragEnd] = useState<Cell | null>(null);
  const [pending, setPending] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("guest_room");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Which cells are already occupied
  const occupied = useCallback((x: number, y: number) => {
    return spaces.some((s) =>
      x >= s.position_x && x < s.position_x + s.width &&
      y >= s.position_y && y < s.position_y + s.height
    );
  }, [spaces]);

  const rect = (a: Cell, b: Cell) => ({
    x: Math.min(a.x, b.x), y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x) + 1, h: Math.abs(a.y - b.y) + 1,
  });

  const handleDown = (x: number, y: number) => {
    if (occupied(x, y) || pending) return;
    setDragStart({ x, y }); setDragEnd({ x, y }); setSelectedId(null);
  };
  const handleEnter = (x: number, y: number) => {
    if (dragStart) setDragEnd({ x, y });
  };
  const handleUp = () => {
    if (dragStart && dragEnd) {
      const r = rect(dragStart, dragEnd);
      // reject if overlaps any occupied cell
      let clash = false;
      for (let dx = 0; dx < r.w; dx++) for (let dy = 0; dy < r.h; dy++)
        if (occupied(r.x + dx, r.y + dy)) clash = true;
      if (!clash) { setPending(r); setName(""); setType("guest_room"); }
    }
    setDragStart(null); setDragEnd(null);
  };

  const save = async () => {
    if (!pending || !name.trim()) return;
    setSaving(true);
    try {
      const space = await createSpace({
        floor_id: floor.id, name: name.trim(), type,
        position_x: pending.x, position_y: pending.y, width: pending.w, height: pending.h,
      });
      onAdd(space);
      setPending(null); setName("");
    } catch { /* ignore */ }
    setSaving(false);
  };

  const remove = async (id: string) => {
    onRemove(id);
    setSelectedId(null);
    try { await deleteSpace(id); } catch { /* ignore */ }
  };

  const preview = dragStart && dragEnd ? rect(dragStart, dragEnd) : null;
  const gridW = cols * CELL + (cols - 1) * GAP;
  const gridH = rows * CELL + (rows - 1) * GAP;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <MousePointer2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>Click and drag across empty cells to draw a room. Click a room to remove it.</span>
        </div>
        <Button size="sm" onClick={onDone}>
          <Check className="h-3.5 w-3.5" />
          Done Editing
        </Button>
      </div>

      <div className="flex gap-4 items-start">
        {/* Grid canvas */}
        <div className="flex-1 overflow-auto">
          <div
            ref={gridRef}
            className="relative rounded-xl border border-white/[0.06] bg-[#0a0a16] p-4 select-none"
            style={{ width: gridW + 32, height: gridH + 32 }}
            onMouseLeave={() => { setDragStart(null); setDragEnd(null); }}
            onMouseUp={handleUp}
          >
            {/* Empty cells */}
            {Array.from({ length: rows }).map((_, y) =>
              Array.from({ length: cols }).map((_, x) => {
                const isOcc = occupied(x + 1, y + 1);
                return (
                  <div
                    key={`${x}-${y}`}
                    onMouseDown={() => handleDown(x + 1, y + 1)}
                    onMouseEnter={() => handleEnter(x + 1, y + 1)}
                    className={cn(
                      "absolute rounded-md transition-colors",
                      !isOcc && "bg-white/[0.015] hover:bg-indigo-500/10 border border-white/[0.03] cursor-crosshair"
                    )}
                    style={{ left: 16 + x * (CELL + GAP), top: 16 + y * (CELL + GAP), width: CELL, height: CELL }}
                  />
                );
              })
            )}

            {/* Existing rooms */}
            {spaces.map((s) => {
              const cfg = SPACE_STATUS_CONFIG[s.status];
              const isSel = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(isSel ? null : s.id)}
                  className={cn(
                    "absolute rounded-md border flex flex-col items-center justify-center p-1 transition-all group",
                    cfg.bg, cfg.border,
                    isSel && "ring-2 ring-red-500 ring-offset-1 ring-offset-[#0a0a16]"
                  )}
                  style={{
                    left: 16 + (s.position_x - 1) * (CELL + GAP),
                    top: 16 + (s.position_y - 1) * (CELL + GAP),
                    width: s.width * CELL + (s.width - 1) * GAP,
                    height: s.height * CELL + (s.height - 1) * GAP,
                  }}
                >
                  <span className={cn("text-[9px] font-semibold leading-tight text-center line-clamp-2", cfg.color)}>{s.name}</span>
                  {isSel && (
                    <span
                      onClick={(e) => { e.stopPropagation(); remove(s.id); }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-400"
                    >
                      <Trash2 className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}

            {/* Drag preview */}
            {preview && (
              <div
                className="absolute rounded-md border-2 border-dashed border-indigo-400 bg-indigo-500/20 pointer-events-none flex items-center justify-center"
                style={{
                  left: 16 + (preview.x - 1) * (CELL + GAP),
                  top: 16 + (preview.y - 1) * (CELL + GAP),
                  width: preview.w * CELL + (preview.w - 1) * GAP,
                  height: preview.h * CELL + (preview.h - 1) * GAP,
                }}
              >
                <span className="text-[10px] text-indigo-300 font-medium">{preview.w}×{preview.h}</span>
              </div>
            )}
          </div>
        </div>

        {/* New room form */}
        <AnimatePresence>
          {pending && (
            <motion.div
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
              className="w-64 shrink-0 glass-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-200">New Room</p>
                <button onClick={() => setPending(null)} className="h-6 w-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06]">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Grid3x3 className="h-3 w-3" />
                {pending.w}×{pending.h} cells at ({pending.x}, {pending.y})
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Room Name</label>
                <Input autoFocus value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Room 215" onKeyDown={(e) => e.key === "Enter" && save()} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-full" onClick={save} disabled={saving || !name.trim()}>
                <Sparkles className="h-3.5 w-3.5" />
                {saving ? "Adding…" : "Add Room"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
