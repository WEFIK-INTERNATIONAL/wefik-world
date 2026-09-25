import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-300">
      {/* Hero / Header Skeleton */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
        <Skeleton className="h-4 w-full max-w-md rounded-lg" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      {/* Grid of Product Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4 shadow-xs">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3 rounded-md" />
              <Skeleton className="h-5 w-4/5 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-border/40">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
