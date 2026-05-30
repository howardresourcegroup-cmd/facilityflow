"use client";

import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuildingCard } from "@/components/buildings/building-card";
import { CreateBuildingModal } from "@/components/buildings/create-building-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_BUILDINGS } from "@/lib/mock-data";
import type { Building } from "@/types";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>(MOCK_BUILDINGS);
  const [showCreate, setShowCreate] = useState(false);

  const stats = {
    total: buildings.length,
    withIssues: buildings.filter((b) => (b._issue_count ?? 0) > 0).length,
    totalSpaces: buildings.reduce((a, b) => a + (b._space_count ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Buildings</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {stats.total} facilities · {stats.totalSpaces} spaces tracked ·{" "}
            {stats.withIssues > 0 ? (
              <span className="text-amber-400">{stats.withIssues} with active issues</span>
            ) : (
              <span className="text-emerald-400">All healthy</span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Add Building
        </Button>
      </div>

      {/* Grid */}
      {buildings.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No buildings yet"
          description="Add your first facility to start visualizing operational data and tracking issues."
          action={{ label: "Add Building", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {buildings.map((b, i) => (
            <BuildingCard key={b.id} building={b} index={i} />
          ))}
        </div>
      )}

      <CreateBuildingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          const newBuilding: Building = {
            id: `b-${Date.now()}`,
            organization_id: "org1",
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            type: data.type,
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            _floor_count: 0,
            _space_count: 0,
            _issue_count: 0,
          };
          setBuildings((prev) => [...prev, newBuilding]);
        }}
      />
    </div>
  );
}
