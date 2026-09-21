"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-[4px] border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-ink data-[state=checked]:text-white data-[state=checked]:border-ink transition-colors",
      className
    )}
    {...props}
  />
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const CheckboxIndicator = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Indicator
    ref={ref}
    className={cn("flex items-center justify-center text-current", className)}
    {...props}
  >
    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
  </CheckboxPrimitive.Indicator>
));
CheckboxIndicator.displayName = CheckboxPrimitive.Indicator.displayName;

export { Checkbox };
