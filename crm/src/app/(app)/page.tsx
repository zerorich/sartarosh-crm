"use client";

import { useState } from "react";
import { CalendarX2 } from "lucide-react";
import { BookingRow } from "@/components/booking/BookingRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { RowsSkeleton } from "@/components/ui/Skeleton";
import { useBookings } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

const TABS = [
  { key: "active", label: "Faol", statuses: ["PENDING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"] },
  { key: "completed", label: "Yakunlangan", statuses: ["COMPLETED"] },
  { key: "cancelled", label: "Bekor/kelmadi", statuses: ["CANCELLED", "NO_SHOW"] },
] as const satisfies { key: string; label: string; statuses: BookingStatus[] }[];

export default function DashboardPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("active");
  const bookings = useBookings({ limit: 100 });

  const activeTab = TABS.find((t) => t.key === tab)!;
  const statuses: BookingStatus[] = [...activeTab.statuses];
  const filtered = (bookings.data?.items ?? []).filter((b) => statuses.includes(b.status));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Bronlar</h1>

      <div className="mb-4 flex gap-1 rounded-xl bg-surface-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              "flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors",
              tab === t.key && "bg-surface shadow-sm",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {bookings.isLoading ? (
        <RowsSkeleton />
      ) : bookings.error ? (
        <ErrorState error={bookings.error} onRetry={() => bookings.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarX2} title="Bu bo'limda bronlar yo'q" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
