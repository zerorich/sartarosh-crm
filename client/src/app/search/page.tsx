"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/search/SearchBar";
import { SalonList } from "@/components/salon/SalonList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLocationStore } from "@/store/location-store";
import * as salonService from "@/services/salons";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 350);
  const location = useLocationStore((s) => s.location);

  const results = useQuery({
    queryKey: ["search", "salons", debounced, location?.lat, location?.lng],
    queryFn: () =>
      location
        ? salonService.fetchNearbySalons({ lat: location.lat, lng: location.lng, radius: 50, search: debounced })
        : salonService.fetchSalons({ search: debounced, limit: 30 }).then((r) => r.items),
    enabled: debounced.trim().length > 0,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <SearchBar value={query} onChange={setQuery} autoFocus className="mb-6" />

      {debounced.trim().length === 0 ? (
        <EmptyState icon={Search} title="Sartaroshxona nomi yoki manzilini kiriting" />
      ) : (
        <SalonList
          salons={results.data}
          isLoading={results.isFetching}
          error={results.error}
          onRetry={() => results.refetch()}
          emptyTitle="Hech narsa topilmadi"
          emptyDescription={`"${debounced}" bo'yicha natija yo'q.`}
        />
      )}
    </div>
  );
}
