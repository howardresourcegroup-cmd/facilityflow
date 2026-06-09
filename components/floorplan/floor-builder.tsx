"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X, Check, MousePointer2, Maximize2 } from "lucide-react";
import type { Floor, Space } from "@/types";
import { cn, SPACE_STATUS_CONFIG } from "@/lib/utils";
import { createSpace, deleteSpace, updateSpace, updateFloorGrid } from "@/lib/data/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Grid constants ──────────────────────────────────────────────────────────
const CELL = 48;
const GAP = 3;
const S = CELL + GAP;   // stride
const PAD = 16;          // canvas padding
const H = 10;            // handle size px

const ROOM_TYPES = [
  "guest_room","suite","cabin","lobby","office","restaurant","kitchen",
  "bar","conference","restroom","housekeeping","maintenance","mechanical",
  "pool","spa","fitness","storage","utility","hallway","elevator","other",
];

type RH = "nw"|"n"|"ne"|"e"|"se"|"s"|"sw"|"w";
const HANDLES: RH[] = ["nw","n","ne","e","se","s","sw","w"];

interface Rect { x:number; y:number; w:number; h:number }
interface DragState {
  type: "none"
      | "create"       // dragging empty cells
      | "move"         // dragging a room body
      | "resize";      // dragging a handle
  spaceId?: string;
  handle?: RH;
  startCell?: { x:number; y:number };
  endCell?:   { x:number; y:number };
  offsetX?: number; // cell offset from room origin during move
  offsetY?: number;
  baseRect?: Rect;  // room's rect when resize started
}

// ── Math helpers ─────────────────────────────────────────────────────────────
function mouse2cell(px: number, py: number, cols: number, rows: number) {
  return {
    x: Math.max(1, Math.min(cols, Math.floor((px - PAD) / S) + 1)),
    y: Math.max(1, Math.min(rows, Math.floor((py - PAD) / S) + 1)),
  };
}
function cells2rect(a: {x:number;y:number}, b: {x:number;y:number}): Rect {
  return { x: Math.min(a.x,b.x), y: Math.min(a.y,b.y), w: Math.abs(a.x-b.x)+1, h: Math.abs(a.y-b.y)+1 };
}
function r2px(r: Rect) {
  return { left: PAD+(r.x-1)*S, top: PAD+(r.y-1)*S, width: r.w*CELL+(r.w-1)*GAP, height: r.h*CELL+(r.h-1)*GAP };
}
function s2px(s: Space) { return r2px({ x:s.position_x, y:s.position_y, w:s.width, h:s.height }); }

function handlePos(h: RH, px: ReturnType<typeof r2px>) {
  const { left:l, top:t, width:w, height:hi } = px;
  const cx = l+w/2-H/2, cy = t+hi/2-H/2, r = l+w-H/2, b = t+hi-H/2;
  const map: Record<RH,{left:number;top:number}> = {
    nw:{left:l-H/2,top:t-H/2}, n:{left:cx,top:t-H/2},  ne:{left:r,top:t-H/2},
    e:{left:r,top:cy},         se:{left:r,top:b},        s:{left:cx,top:b},
    sw:{left:l-H/2,top:b},     w:{left:l-H/2,top:cy},
  };
  return map[h];
}
function handleCursor(h: RH) {
  if (h==="nw"||h==="se") return "cursor-nwse-resize";
  if (h==="ne"||h==="sw") return "cursor-nesw-resize";
  if (h==="n" ||h==="s")  return "cursor-ns-resize";
  return "cursor-ew-resize";
}

function applyResize(base: Rect, h: RH, dc: {x:number;y:number}, cols: number, rows: number): Rect {
  let { x, y, w, hi: height } = { x: base.x, y: base.y, w: base.w, hi: base.h };
  if (h.includes("w")) { const nx = Math.min(base.x+base.w-1, base.x+dc.x); w = base.w-(nx-base.x); x = nx; }
  if (h.includes("e")) { w = Math.max(1, base.w+dc.x); }
  if (h.includes("n")) { const ny = Math.min(base.y+base.h-1, base.y+dc.y); height = base.h-(ny-base.y); y = ny; }
  if (h.includes("s")) { height = Math.max(1, base.h+dc.y); }
  x = Math.max(1, x); y = Math.max(1, y);
  w = Math.max(1, Math.min(w, cols-x+1));
  height = Math.max(1, Math.min(height, rows-y+1));
  return { x, y, w, h: height };
}

function overlaps(r: Rect, spaces: Space[], excludeId: string|null) {
  return spaces.some(s => {
    if (s.id===excludeId) return false;
    return r.x < s.position_x+s.width && r.x+r.w > s.position_x &&
           r.y < s.position_y+s.height && r.y+r.h > s.position_y;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  floor: Floor;
  spaces: Space[];
  onAdd:        (s: Space) => void;
  onRemove:     (id: string) => void;
  onPatch:      (id: string, patch: Partial<Space>) => void;
  onPatchFloor: (patch: Partial<Floor>) => void;
  onDone:       () => void;
}

export function FloorBuilder({ floor, spaces, onAdd, onRemove, onPatch, onPatchFloor, onDone }: Props) {
  const cols = floor.grid_cols ?? 16;
  const rows = floor.grid_rows ?? 10;

  const containerRef  = useRef<HTMLDivElement>(null);
  const drag          = useRef<DragState>({ type:"none" });
  const [liveRect, setLiveRect]         = useState<Rect|null>(null);
  const [selectedId, setSelectedId]     = useState<string|null>(null);
  const [pending, setPending]           = useState<Rect|null>(null);   // rect waiting for name
  const [newName, setNewName]           = useState("");
  const [newType, setNewType]           = useState("guest_room");
  const [editName, setEditName]         = useState("");
  const [editType, setEditType]         = useState("guest_room");
  const [saving, setSaving]             = useState(false);
  const [clash, setClash]               = useState(false);

  // Sync edit panel when selection changes
  useEffect(() => {
    const s = spaces.find(s => s.id===selectedId);
    if (s) { setEditName(s.name); setEditType(s.type); }
  }, [selectedId, spaces]);

  // ── relative mouse position → cell ─────────────────────────────────────────
  const evCell = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return mouse2cell(e.clientX-rect.left, e.clientY-rect.top, cols, rows);
  }, [cols, rows]);

  // ── mouse handlers ──────────────────────────────────────────────────────────
  const onGridDown = useCallback((e: React.MouseEvent) => {
    if (e.button!==0) return;
    e.preventDefault();
    const cell = evCell(e);
    // Only start CREATE if click is on an empty cell (room downs are handled separately)
    if (!(e.target as HTMLElement).closest("[data-space]")) {
      setSelectedId(null); setPending(null);
      drag.current = { type:"create", startCell:cell, endCell:cell };
      setLiveRect({ x:cell.x, y:cell.y, w:1, h:1 });
    }
  }, [evCell]);

  const onSpaceDown = useCallback((e: React.MouseEvent, s: Space) => {
    if (e.button!==0) return;
    e.stopPropagation(); e.preventDefault();
    const cell = evCell(e);
    setSelectedId(s.id); setPending(null);
    drag.current = {
      type:"move", spaceId:s.id,
      offsetX: cell.x - s.position_x,
      offsetY: cell.y - s.position_y,
      endCell: cell,
    };
    setLiveRect({ x:s.position_x, y:s.position_y, w:s.width, h:s.height });
  }, [evCell]);

  const onHandleDown = useCallback((e: React.MouseEvent, s: Space, h: RH) => {
    if (e.button!==0) return;
    e.stopPropagation(); e.preventDefault();
    const cell = evCell(e);
    drag.current = {
      type:"resize", spaceId:s.id, handle:h,
      startCell: cell,
      baseRect: { x:s.position_x, y:s.position_y, w:s.width, h:s.height },
    };
    setLiveRect({ x:s.position_x, y:s.position_y, w:s.width, h:s.height });
  }, [evCell]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const d = drag.current;
    if (d.type==="none") return;
    const cell = evCell(e);

    if (d.type==="create") {
      drag.current = { ...d, endCell:cell };
      setLiveRect(cells2rect(d.startCell!, cell));
    }
    if (d.type==="move") {
      const s = spaces.find(s=>s.id===d.spaceId);
      if (!s) return;
      const nx = Math.max(1, Math.min(cols-s.width+1, cell.x-(d.offsetX??0)));
      const ny = Math.max(1, Math.min(rows-s.height+1, cell.y-(d.offsetY??0)));
      const r: Rect = { x:nx, y:ny, w:s.width, h:s.height };
      drag.current = { ...d, endCell:cell };
      setClash(overlaps(r, spaces, d.spaceId!));
      setLiveRect(r);
    }
    if (d.type==="resize") {
      const dc = { x: cell.x-(d.startCell!.x), y: cell.y-(d.startCell!.y) };
      const r = applyResize(d.baseRect!, d.handle!, dc, cols, rows);
      setClash(overlaps(r, spaces, d.spaceId!));
      setLiveRect(r);
    }
  }, [evCell, spaces, cols, rows]);

  const onMouseUp = useCallback(async (e: React.MouseEvent) => {
    const d = drag.current;
    drag.current = { type:"none" };

    if (d.type==="create" && d.startCell && d.endCell) {
      const r = cells2rect(d.startCell, d.endCell);
      if (!overlaps(r, spaces, null)) {
        setPending(r); setNewName(""); setNewType("guest_room");
      }
      setLiveRect(null);
      return;
    }
    if ((d.type==="move"||d.type==="resize") && liveRect && !clash) {
      const s = spaces.find(s=>s.id===d.spaceId);
      if (s && liveRect) {
        const patch = { position_x:liveRect.x, position_y:liveRect.y, width:liveRect.w, height:liveRect.h };
        onPatch(d.spaceId!, patch);
        await updateSpace(d.spaceId!, patch).catch(()=>{});
      }
    }
    setLiveRect(null); setClash(false);
  }, [liveRect, clash, spaces, onPatch]);

  // ── create room ─────────────────────────────────────────────────────────────
  const saveNew = async () => {
    if (!pending||!newName.trim()) return;
    setSaving(true);
    try {
      const space = await createSpace({
        floor_id:floor.id, name:newName.trim(), type:newType,
        position_x:pending.x, position_y:pending.y, width:pending.w, height:pending.h,
      });
      onAdd(space); setPending(null); setNewName("");
    } catch {/* ignore */}
    setSaving(false);
  };

  // ── save edits to selected room ──────────────────────────────────────────────
  const saveEdit = async () => {
    if (!selectedId||!editName.trim()) return;
    const patch = { name:editName.trim(), type:editType };
    onPatch(selectedId, patch);
    await updateSpace(selectedId, patch).catch(()=>{});
  };

  // ── delete selected ──────────────────────────────────────────────────────────
  const deleteSelected = async () => {
    if (!selectedId) return;
    onRemove(selectedId);
    setSelectedId(null);
    await deleteSpace(selectedId).catch(()=>{});
  };

  // ── grid size ─────────────────────────────────────────────────────────────────
  const [colsInput, setColsInput] = useState(String(cols));
  const [rowsInput, setRowsInput] = useState(String(rows));

  const applyGridSize = async () => {
    const nc = Math.max(4, Math.min(40, parseInt(colsInput)||cols));
    const nr = Math.max(4, Math.min(40, parseInt(rowsInput)||rows));
    if (nc===cols && nr===rows) return;
    onPatchFloor({ grid_cols:nc, grid_rows:nr });
    await updateFloorGrid(floor.id, { grid_cols:nc, grid_rows:nr }).catch(()=>{});
  };

  // ── derived ──────────────────────────────────────────────────────────────────
  const selectedSpace = spaces.find(s=>s.id===selectedId)??null;
  const sidePanel = pending || selectedSpace;
  const gridW = cols*CELL+(cols-1)*GAP+PAD*2;
  const gridH = rows*CELL+(rows-1)*GAP+PAD*2;

  // Which space is being dragged (render as ghost)
  const draggingId = drag.current.type==="move"||drag.current.type==="resize" ? drag.current.spaceId : null;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <MousePointer2 className="h-3.5 w-3.5 text-indigo-400" />
          Drag empty cells to draw · drag room to move · drag handles to resize
        </div>
        <div className="flex items-center gap-3">
          {/* Grid size */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Grid:</span>
            <input type="number" min={4} max={40} value={colsInput}
              onChange={e=>setColsInput(e.target.value)}
              onBlur={applyGridSize} onKeyDown={e=>e.key==="Enter"&&applyGridSize()}
              className="w-12 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-center text-xs px-1" />
            <span>×</span>
            <input type="number" min={4} max={40} value={rowsInput}
              onChange={e=>setRowsInput(e.target.value)}
              onBlur={applyGridSize} onKeyDown={e=>e.key==="Enter"&&applyGridSize()}
              className="w-12 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-center text-xs px-1" />
          </div>
          <Button size="sm" onClick={onDone}><Check className="h-3.5 w-3.5" /> Done</Button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* ── Canvas ── */}
        <div className="flex-1 overflow-auto">
          <div
            ref={containerRef}
            className="relative rounded-xl border border-white/[0.06] bg-[#0a0a16] select-none"
            style={{ width:gridW, height:gridH, minWidth:gridW }}
            onMouseDown={onGridDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={e => { if (drag.current.type!=="none") onMouseUp(e); }}
          >
            {/* Grid dots */}
            {Array.from({length:rows}).map((_,y)=>
              Array.from({length:cols}).map((_,x)=>(
                <div key={`${x}-${y}`} className="absolute rounded-sm pointer-events-none"
                  style={{
                    left: PAD+x*S, top: PAD+y*S, width:CELL, height:CELL,
                    background:"rgba(255,255,255,0.012)",
                    border:"1px solid rgba(255,255,255,0.025)",
                  }} />
              ))
            )}

            {/* Existing rooms */}
            {spaces.map(s => {
              const px   = s2px(s);
              const cfg  = SPACE_STATUS_CONFIG[s.status] ?? SPACE_STATUS_CONFIG["operational"];
              const isSel = s.id===selectedId;
              const isDrag = s.id===draggingId;
              return (
                <div key={s.id} data-space={s.id}
                  onMouseDown={e=>onSpaceDown(e,s)}
                  className={cn(
                    "absolute rounded-md border flex flex-col items-center justify-center p-1 transition-opacity",
                    cfg.bg, cfg.border,
                    isSel && "ring-2 ring-indigo-400 ring-offset-1 ring-offset-[#0a0a16]",
                    isDrag ? "opacity-30 cursor-grabbing" : "cursor-grab hover:brightness-110",
                  )}
                  style={{ ...px, zIndex: isSel ? 20 : 10 }}
                >
                  <span className={cn("text-[9px] font-semibold leading-tight text-center line-clamp-2 select-none", cfg.color)}>{s.name}</span>

                  {/* Resize handles — only on selected, non-dragging room */}
                  {isSel && !isDrag && HANDLES.map(h => (
                    <div key={h}
                      onMouseDown={e=>onHandleDown(e,s,h)}
                      className={cn("absolute rounded-sm bg-indigo-400 border-2 border-[#0a0a16] z-30", handleCursor(h))}
                      style={{ width:H, height:H, ...handlePos(h,px) }}
                    />
                  ))}
                </div>
              );
            })}

            {/* Live preview: create rect */}
            {drag.current.type==="create" && liveRect && (
              <div className="absolute rounded-md border-2 border-dashed border-indigo-400 bg-indigo-500/20 pointer-events-none flex items-center justify-center"
                style={r2px(liveRect)}>
                <span className="text-[10px] text-indigo-300 font-medium">{liveRect.w}×{liveRect.h}</span>
              </div>
            )}

            {/* Live preview: move / resize ghost */}
            {(drag.current.type==="move"||drag.current.type==="resize") && liveRect && (
              <div className={cn(
                "absolute rounded-md border-2 pointer-events-none flex items-center justify-center",
                clash ? "border-red-400 bg-red-500/20" : "border-indigo-400 bg-indigo-500/20"
              )} style={{ ...r2px(liveRect), zIndex:50 }}>
                {clash && <span className="text-[10px] text-red-300">Overlaps</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── Side panel ── */}
        <AnimatePresence>
          {(pending||selectedSpace) && (
            <motion.div initial={{x:20,opacity:0}} animate={{x:0,opacity:1}} exit={{x:20,opacity:0}}
              className="w-60 shrink-0 glass-card p-4 space-y-3">
              {pending ? (
                /* Create form */
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-200">New Room</p>
                    <button onClick={()=>setPending(null)} className="h-6 w-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-600">{pending.w}×{pending.h} cells at ({pending.x},{pending.y})</p>
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
                      placeholder="Room 215" onKeyDown={e=>e.key==="Enter"&&saveNew()} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map(t=>(
                          <SelectItem key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="w-full" onClick={saveNew} disabled={saving||!newName.trim()}>
                    {saving?"Adding…":"Add Room"}
                  </Button>
                </>
              ) : selectedSpace ? (
                /* Edit form */
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-200">Edit Room</p>
                    <button onClick={()=>setSelectedId(null)} className="h-6 w-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {selectedSpace.width}×{selectedSpace.height} cells · ({selectedSpace.position_x},{selectedSpace.position_y})
                  </p>
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input value={editName} onChange={e=>setEditName(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&saveEdit()} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={editType} onValueChange={setEditType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map(t=>(
                          <SelectItem key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="w-full" onClick={saveEdit} disabled={!editName.trim()}>
                    Save Changes
                  </Button>
                  <button onClick={deleteSelected}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-300 py-1.5 rounded-lg hover:bg-red-500/[0.08] transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Delete Room
                  </button>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
