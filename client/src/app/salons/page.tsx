"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { List, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { SalonList } from "@/components/salon/SalonList";
import { FilterSheet, type SalonFilters } from "@/components/search/FilterSheet";
import { LocationPickerSheet } from "@/components/location/LocationPickerSheet";
import { Button } from "@/components/ui/Button";
import { useNearbySalons } from "@/hooks/queries";
import { useLocationStore } from "@/store/location-store";
import { cn } from "@/lib/utils";

const SalonsMap = dynamic(() => import("@/components/map/SalonsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface-muted text-sm text-muted">
      Xarita yuklanmoqda...
    </div>
  ),
});

function SalonsPageContent() {
  const location = useLocationStore((s) => s.location);
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: SalonFilters = useMemo(
    () => ({
      radius: Number(searchParams.get("radius") ?? 5),
      minRating: searchParams.get("rating") ? Number(searchParams.get("rating")) : null,
      sort: (searchParams.get("sort") as SalonFilters["sort"]) ?? "nearest",
    }),
    [searchParams],
  );

  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  function applyFilters(next: SalonFilters) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("radius", String(next.radius));
    if (next.minRating) params.set("rating", String(next.minRating));
    else params.delete("rating");
    params.set("sort", next.sort);
    router.replace(`/salons?${params.toString()}`);
  }

  const nearby = useNearbySalons(location?.lat ?? null, location?.lng ?? null, filters.radius);

  const salons = useMemo(() => {
    let items = nearby.data ?? [];
    if (filters.minRating) items = items.filter((s) => s.rating >= filters.minRating!);
    if (filters.sort === "rating") items = [...items].sort((a, b) => b.rating - a.rating);
    return items;
  }, [nearby.data, filters]);

  if (!location) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-sm text-muted">Sartaroshxonalarni ko&apos;rish uchun joylashuvni tanlang.</p>
        <Button onClick={() => setPickerOpen(true)}>Joylashuvni tanlash</Button>
        <LocationPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:h-[calc(100vh-4rem)] md:flex-row md:gap-0 md:overflow-hidden md:py-0">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex flex-1 gap-1 rounded-xl bg-surface-muted p-1">
          <button
            onClick={() => setMobileView("list")}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium",
              mobileView === "list" && "bg-surface shadow-sm",
            )}
          >
            <List className="size-4" aria-hidden /> Ro&apos;yxat
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium",
              mobileView === "map" && "bg-surface shadow-sm",
            )}
          >
            <MapIcon className="size-4" aria-hidden /> Xarita
          </button>
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Filtrlar"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
        </button>
      </div>

      <div
        className={cn(
          "w-full overflow-y-auto md:w-[420px] md:shrink-0 md:border-r md:border-border md:px-4 md:py-4",
          mobileView === "map" && "hidden md:block",
        )}
      >
        <div className="mb-3 hidden items-center justify-between md:flex">
          <h1 className="text-lg font-bold">Sartaroshxonalar</h1>
          <button
            onClick={() => setFilterOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
          >
            <SlidersHorizontal className="size-4" aria-hidden /> Filtrlar
          </button>
        </div>
        <SalonList
          layout="list"
          salons={salons}
          isLoading={nearby.isLoading}
          error={nearby.error}
          onRetry={() => nearby.refetch()}
          emptyAction={
            <Button variant="outline" size="sm" onClick={() => applyFilters({ ...filters, radius: filters.radius * 2 })}>
              Radiusni kengaytirish
            </Button>
          }
        />
      </div>

      <div className={cn("h-[60vh] w-full md:h-full md:flex-1", mobileView === "list" && "hidden md:block")}>
        <SalonsMap
          userLocation={location}
          salons={salons}
          selectedSalonId={selectedSalonId}
          onSelectSalon={setSelectedSalonId}
          onViewSalon={(id) => router.push(`/salons/${id}`)}
          className="h-full w-full"
        />
      </div>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onApply={applyFilters} />
    </div>
  );
}

export default function SalonsPage() {
  return (
    <Suspense>
      <SalonsPageContent />
    </Suspense>
  );
}
