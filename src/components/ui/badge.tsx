import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--surface-inverted)] text-[var(--text-inverted)]",
        secondary:
          "border-transparent bg-[var(--surface-2)] text-[var(--text-primary)]",
        destructive:
          "border-transparent bg-error/15 text-error border-error/30",
        outline:
          "text-[var(--text-primary)] border-[var(--border)]",
        lime:
          "border-lime/40 bg-lime/20 text-deep-green-dark dark:text-lime font-bold",
        solidLime:
          "border-transparent bg-lime text-[#0a0f0a] font-bold",
        green:
          "border-deep-green/30 bg-deep-green/15 text-deep-green dark:text-brand font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
