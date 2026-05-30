import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/[0.06] border-white/[0.08] text-zinc-300",
        primary: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
        success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
        warning: "bg-amber-500/15 border-amber-500/30 text-amber-400",
        danger: "bg-red-500/15 border-red-500/30 text-red-400",
        critical: "bg-red-500/20 border-red-500/50 text-red-300",
        info: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
        orange: "bg-orange-500/15 border-orange-500/30 text-orange-400",
        muted: "bg-zinc-800/60 border-zinc-700/50 text-zinc-500",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
