import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-muted", className)} />;
}

export function SalonCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-1 h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SalonCardSkeletonCompact() {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-surface p-2.5 shadow-sm">
      <Skeleton className="aspect-square h-24 w-24 shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SalonListSkeleton({ count = 4, layout = "grid" }: { count?: number; layout?: "grid" | "list" }) {
  if (layout === "list") {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SalonCardSkeletonCompact key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SalonCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
