import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="h-4 w-24 rounded shimmer" />
      <div className="h-8 w-16 rounded shimmer" />
      <div className="h-3 w-32 rounded shimmer" />
    </div>
  );
}
