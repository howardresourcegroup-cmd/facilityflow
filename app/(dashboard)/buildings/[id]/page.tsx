"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FloorGrid } from "@/components/floorplan/floor-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_BUILDINGS, MOCK_FLOORS } from "@/lib/mock-data";
import { useDataStore } from "@/lib/store/data-store";
import { useState } from "react";
import { Layers } from "lucide-react";
import type { SpaceStatus } from "@/types";

export default function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { spaces, updateSpaceStatus } = useDataStore();

  const building = MOCK_BUILDINGS.find((b) => b.id === id) ?? MOCK_BUILDINGS[0];
  const floors   = MOCK_FLOORS.filter((f) => f.building_id === building.id);
  const [activeFloorId, setActiveFloorId] = useState(floors[0]?.id ?? "");

  const buildingSpaces = spaces.filter((s) => floors.some((f) => f.id === s.floor_id));
  const totalIssues    = buildingSpaces.filter((s) => s.status !== "operational").length;

  const handleStatusChange = (spaceId: string, status: SpaceStatus) => {
    updateSpaceStatus(spaceId, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/buildings" className="hover:text-zinc-300 transition-colors">Buildings</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-300">{building.name}</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/20">
            <Building2 className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{building.name}</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {building.address && `${building.address}, `}{building.city}, {building.state}
              {" · "}{floors.length} floor{floors.length !== 1 ? "s" : ""}
              {" · "}{buildingSpaces.length} spaces
              {totalIssues > 0 && <span className="text-amber-400"> · {totalIssues} issues</span>}
            </p>
          </div>
        </div>
        <Button size="sm" variant="secondary">
          <Plus className="h-4 w-4" />
          Add Floor
        </Button>
      </div>

      {floors.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No floors configured"
          description="Add floors to start mapping spaces."
          action={{ label: "Add Floor", onClick: () => {} }}
        />
      ) : (
        <Tabs value={activeFloorId} onValueChange={setActiveFloorId}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList>
              {floors.map((f) => {
                const fSpaces  = spaces.filter((s) => s.floor_id === f.id);
                const fIssues  = fSpaces.filter((s) => s.status !== "operational").length;
                return (
                  <TabsTrigger key={f.id} value={f.id} className="gap-2">
                    {f.name}
                    {fIssues > 0 && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{fIssues}</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <Button size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5" />
              Add Space
            </Button>
          </div>

          {floors.map((f) => (
            <TabsContent key={f.id} value={f.id} className="mt-4">
              <FloorGrid
                floor={f}
                spaces={spaces.filter((s) => s.floor_id === f.id)}
                onStatusChange={handleStatusChange}
                onCreateWorkOrder={(spaceId) => {
                  router.push(`/work-orders/new?space=${spaceId}`);
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
