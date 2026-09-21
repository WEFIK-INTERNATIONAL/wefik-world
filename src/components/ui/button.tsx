import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-white shadow hover:bg-black active:scale-[0.99]",
        lime:
          "bg-lime text-ink font-semibold shadow hover:bg-[#8fd32b] active:scale-[0.99]",
        green:
          "bg-deep-green text-white shadow hover:bg-[#3d5a15] active:scale-[0.99]",
        destructive:
          "bg-error text-white shadow-sm hover:bg-red-600",
        outline:
          "border border-border bg-white text-ink hover:bg-surface hover:text-ink",
        secondary:
          "bg-surface text-ink hover:bg-[#eaecee]",
        ghost:
          "hover:bg-surface hover:text-ink",
        link:
          "text-deep-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[10px] px-3 text-xs",
        lg: "h-12 rounded-[14px] px-6 text-base",
        icon: "h-10 w-10",
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
