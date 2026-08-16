"use client";

import { SalonList } from "@/components/salon/SalonList";
import { useSavedSalons } from "@/hooks/queries";

export default function SavedSalonsPage() {
  const saved = useSavedSalons();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Saqlangan salonlar</h1>
      <SalonList
        salons={saved.data}
        isLoading={saved.isLoading}
        error={saved.error}
        onRetry={() => saved.refetch()}
        emptyTitle="Hali saqlangan salon yo'q"
        emptyDescription="Salon kartasidagi yurak belgisini bosib saqlab qo'ying."
      />
    </div>
  );
}
