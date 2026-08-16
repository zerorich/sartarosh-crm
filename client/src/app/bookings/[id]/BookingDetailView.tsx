"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { DelayNotice } from "@/components/booking/DelayNotice";
import { ReviewForm } from "@/components/review/ReviewForm";
import { useBooking, useCancelBooking, useCreateReview } from "@/hooks/queries";
import { formatDateWithWeekday, formatMoney, formatTime } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-messages";

const CANCELLABLE = new Set(["PENDING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"]);

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const booking = useBooking(bookingId);
  const cancelBooking = useCancelBooking();
  const createReview = useCreateReview();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (booking.isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-4 h-48 w-full" />
      </div>
    );
  }

  if (booking.error || !booking.data) {
    return <ErrorState error={booking.error} onRetry={() => booking.refetch()} title="Bron topilmadi" />;
  }

  const b = booking.data;
  const latestPayment = [...b.payments].sort((a, z) => a.createdAt.localeCompare(z.createdAt)).at(-1);

  async function handleCancel() {
    setCancelError(null);
    try {
      await cancelBooking.mutateAsync({ id: bookingId });
    } catch (err) {
      setCancelError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{b.salon.name}</h1>
        <BookingStatusBadge status={b.status} />
      </div>

      <DelayNotice delayMinutes={b.delayMinutes} coupon={b.coupon} />

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <Row label="Xizmat" value={b.service.name} />
        <Row label="Sana" value={formatDateWithWeekday(b.startAt)} />
        <Row label="Vaqt" value={formatTime(b.startAt)} />
        <div className="my-1 border-t border-border" />
        <Row label="Narx" value={formatMoney(b.price)} />
        <Row label="To'lov usuli" value="Naqd (joyida)" />
        {latestPayment && <Row label="To'lov holati" value={paymentStatusLabel(latestPayment.status)} />}
      </div>

      {cancelError && <p className="mt-3 text-sm text-danger">{cancelError}</p>}

      {CANCELLABLE.has(b.status) && (
        <Button
          variant="outline"
          className="mt-4 border-danger text-danger hover:bg-danger/10"
          loading={cancelBooking.isPending}
          onClick={handleCancel}
          fullWidth
        >
          Bronni bekor qilish
        </Button>
      )}

      {b.status === "COMPLETED" && !b.review && !reviewSubmitted && (
        <div className="mt-6">
          <ReviewForm
            submitting={createReview.isPending}
            onSubmit={async (input) => {
              await createReview.mutateAsync({ bookingId, ...input });
              setReviewSubmitted(true);
            }}
          />
        </div>
      )}

      {(b.review || reviewSubmitted) && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Sharhingiz uchun rahmat!
        </div>
      )}

      <Button variant="ghost" className="mt-4" onClick={() => router.push("/bookings")} fullWidth>
        Bronlarga qaytish
      </Button>
    </div>
  );
}

function paymentStatusLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "To'langan";
    case "PENDING":
      return "Kutilmoqda";
    case "FAILED":
      return "Muvaffaqiyatsiz";
    case "REFUNDED":
      return "Qaytarilgan";
    default:
      return status;
  }
}
