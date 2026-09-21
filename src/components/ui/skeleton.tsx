import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-[12px] bg-surface border border-border/50", className)}
      {...props}
    />
  );
}

export { Skeleton };
