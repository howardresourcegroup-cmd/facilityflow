"use client";

import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuildingCard } from "@/components/buildings/building-card";
import { CreateBuildingModal } from "@/components/buildings/create-building-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonCard } from "@/components/shared/loading-spinner";
import { useBuildings } from "@/lib/data/hooks";

export default function BuildingsPage() {
  const { buildings, loading, reload } = useBuildings();
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
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : buildings.length === 0 ? (
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

      <CreateBuildingModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={reload} />
    </div>
  );
}
