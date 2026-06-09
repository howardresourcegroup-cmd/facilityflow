"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Check, Loader2 } from "lucide-react";
import { useBuildings } from "@/lib/data/hooks";
import { setupBuilding } from "@/lib/data/queries";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Gate: until the org has at least one building, walk the user through creating one.
// Everything downstream (floor plan, housekeeping, work orders) reads from this.
export function BuildingSetupGuard({ children }: { children: React.ReactNode }) {
  const { buildings, loading, reload } = useBuildings();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
      </div>
    );
  }
  if (buildings.length === 0) return <BuildingSetupWizard onDone={reload} />;
  return <>{children}</>;
}

const TYPES = ["Hotel", "Lodge", "Resort", "Inn", "Other"];

function BuildingSetupWizard({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Hotel");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [floors, setFloors] = useState(3);
  const [rooms, setRooms] = useState(12);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = Math.max(0, floors) * Math.max(0, rooms);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Give your property a name."); return; }
    setSaving(true); setError("");
    try {
      await setupBuilding({
        name: name.trim(), type: type.toLowerCase(), address: "", city: city.trim(), state: state.trim(),
        floorCount: Math.max(1, Math.min(50, floors)), roomsPerFloor: Math.max(0, Math.min(200, rooms)),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the building.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <LogoMark className="h-11 w-11 rounded-xl shadow-lg shadow-indigo-500/25 mb-4" />
          <h1 className="text-2xl font-bold text-zinc-100">Set up your first property</h1>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-sm">
            Roomward builds everything — floor plans, the housekeeping board, and work orders —
            from this one definition. You can fine-tune rooms later.
          </p>
        </div>

        <form onSubmit={submit} className="glass-card p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bname">Property name</Label>
            <Input id="bname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grandview Resort & Lodge" autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    type === t ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300" : "border-white/[0.08] text-zinc-400 hover:border-white/20"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lake Haven" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="GA" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="floors">Floors</Label>
              <Input id="floors" type="number" min={1} max={50} value={floors} onChange={(e) => setFloors(+e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rooms">Rooms per floor</Label>
              <Input id="rooms" type="number" min={0} max={200} value={rooms} onChange={(e) => setRooms(+e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
            <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            Creates <span className="text-zinc-200 font-medium">{floors} floors</span> and
            <span className="text-zinc-200 font-medium">{total} guest rooms</span> — all live on the housekeeping board.
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Building your property…</> : <>Create property <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        <p className="text-center text-[11px] text-zinc-600 mt-4 flex items-center justify-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-500" /> You can add more buildings, floors, and rooms anytime.
        </p>
      </motion.div>
    </div>
  );
}
