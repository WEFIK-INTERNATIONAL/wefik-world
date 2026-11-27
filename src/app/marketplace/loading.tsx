import { ProductCardSkeleton } from '@/components/marketplace/product-card';

export default function MarketplaceLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+2rem)] pb-16">
      <div className="mb-8 space-y-2">
        <div className="h-4 w-32 rounded bg-[var(--surface-2)] animate-pulse" />
        <div className="h-9 w-72 rounded bg-[var(--surface-2)] animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-[var(--surface-2)] animate-pulse" />
      </div>

      <div className="h-24 w-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-pulse mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

