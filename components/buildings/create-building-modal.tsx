"use client";

import { Building2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { BuildingSetupForm } from "./building-setup-form";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateBuildingModal({ open, onClose, onCreated }: Props) {
  const handleDone = () => {
    onCreated?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
              <Building2 className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <DialogTitle>Add Building</DialogTitle>
              <DialogDescription>Describe it in plain English or configure manually.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <BuildingSetupForm
            onDone={handleDone}
            onCancel={onClose}
            submitLabel="Create building"
            aiFirst={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
