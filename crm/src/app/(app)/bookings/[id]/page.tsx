"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { BookingActions } from "@/components/booking/BookingActions";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useBooking } from "@/hooks/queries";
import { formatDateWithWeekday, formatMoney, formatTime, fullName } from "@/lib/utils";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const booking = useBooking(id);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link href="/" className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Bronlarga qaytish
      </Link>

      {booking.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : booking.error || !booking.data ? (
        <ErrorState error={booking.error} onRetry={() => booking.refetch()} title="Bron topilmadi" />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">{fullName(booking.data.client) || booking.data.client.email}</h1>
            <BookingStatusBadge status={booking.data.status} />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <Row label="Email" value={booking.data.client.email} />
            <Row label="Xizmat" value={booking.data.service.name} />
            <Row label="Sana" value={formatDateWithWeekday(booking.data.startAt)} />
            <Row label="Vaqt" value={formatTime(booking.data.startAt)} />
            {booking.data.delayMinutes > 0 && <Row label="Kechikish" value={`${booking.data.delayMinutes} daqiqa`} />}
            <div className="my-1 border-t border-border" />
            <Row label="Narx" value={formatMoney(booking.data.price)} />
            <Row
              label="To'lov"
              value={booking.data.payments.some((p) => p.status === "PAID") ? "Naqd qabul qilindi" : "Kutilmoqda"}
            />
          </div>

          <div className="mt-4">
            <BookingActions booking={booking.data} />
          </div>
        </>
      )}
    </div>
  );
}
