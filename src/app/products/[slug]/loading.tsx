import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="w-20 h-14 rounded-xl" />
            <Skeleton className="w-20 h-14 rounded-xl" />
            <Skeleton className="w-20 h-14 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-[460px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

