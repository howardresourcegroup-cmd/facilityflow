import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/10",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-white/10 bg-transparent text-foreground hover:bg-foreground/[0.06] hover:text-white",
        secondary: "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1] border border-border",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]",
        link: "text-indigo-400 underline-offset-4 hover:underline",
        success: "bg-emerald-600 text-white hover:bg-emerald-500",
        warning: "bg-amber-600 text-white hover:bg-amber-500",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
