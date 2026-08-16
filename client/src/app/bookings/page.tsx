"use client";

import { useMemo, useState } from "react";
import { CalendarX2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookingCard } from "@/components/booking/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useBookings } from "@/hooks/queries";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

const TABS = [
  { key: "upcoming", label: "Kelayotgan", statuses: ["PENDING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"] },
  { key: "completed", label: "Yakunlangan", statuses: ["COMPLETED"] },
  { key: "cancelled", label: "Bekor qilingan", statuses: ["CANCELLED", "NO_SHOW"] },
] as const satisfies { key: string; label: string; statuses: BookingStatus[] }[];

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("upcoming");
  const bookings = useBookings();

  const filtered = useMemo(() => {
    const active = TABS.find((t) => t.key === tab)!;
    const statuses: BookingStatus[] = [...active.statuses];
    return (bookings.data?.items ?? []).filter((b) => statuses.includes(b.status));
  }, [bookings.data, tab]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <EmptyState
          icon={UserRound}
          title="Bronlaringizni ko'rish uchun kiring"
          action={<Button onClick={() => router.push("/login?redirect=/bookings")}>Kirish</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Mening bronlarim</h1>

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
        <div className="flex flex-col gap-2">
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      ) : bookings.error ? (
        <ErrorState error={bookings.error} onRetry={() => bookings.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarX2} title="Bu bo'limda bronlar yo'q" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
