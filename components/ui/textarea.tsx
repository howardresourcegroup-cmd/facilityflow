import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-border bg-foreground/[0.04] px-3 py-2",
        "text-sm text-foreground placeholder:text-muted-foreground resize-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
