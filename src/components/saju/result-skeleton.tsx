'use client';

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
  );
}

export function ResultSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <Shimmer className="h-8 w-56" />
        <div className="flex gap-2">
          <Shimmer className="h-5 w-28 rounded-full" />
          <Shimmer className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Four pillars skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <Shimmer className="h-7 rounded-none" />
            <div className="space-y-2 p-3">
              <Shimmer className="mx-auto h-4 w-16" />
              <Shimmer className="mx-auto h-16 w-full rounded-lg" />
              <Shimmer className="mx-auto h-16 w-full rounded-lg" />
              <Shimmer className="mx-auto h-4 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="mt-8">
        <Shimmer className="h-10 w-full rounded-lg" />
        <div className="mt-4 space-y-3">
          <Shimmer className="h-64 w-full" />
          <Shimmer className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
