"use client";

import { useState } from "react";
import { Banknote, CheckCircle2, PlayCircle, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useArriveBooking,
  useCompleteBooking,
  useNoShowBooking,
  useRecordCashPayment,
  useStartBooking,
} from "@/hooks/queries";
import { getErrorMessage } from "@/lib/error-messages";
import type { Booking } from "@/types/booking";

/**
 * Mirrors the backend's assertStatus rules exactly (booking.service.ts) so
 * this never offers an action the API would reject:
 *  - arrive: CONFIRMED only
 *  - start: CONFIRMED or ARRIVED
 *  - complete: IN_PROGRESS only
 *  - no-show: CONFIRMED or ARRIVED
 */
export function BookingActions({ booking }: { booking: Booking }) {
  const [error, setError] = useState<string | null>(null);
  const arrive = useArriveBooking();
  const start = useStartBooking();
  const complete = useCompleteBooking();
  const noShow = useNoShowBooking();
  const recordCash = useRecordCashPayment();

  const isPaid = booking.payments.some((p) => p.status === "PAID");
  const busy = arrive.isPending || start.isPending || complete.isPending || noShow.isPending || recordCash.isPending;

  async function run(mutateAsync: () => Promise<unknown>) {
    setError(null);
    try {
      await mutateAsync();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {booking.status === "CONFIRMED" && (
          <Button size="sm" variant="outline" loading={arrive.isPending} disabled={busy} onClick={() => run(() => arrive.mutateAsync(booking.id))}>
            <UserCheck className="size-4" aria-hidden /> Keldi
          </Button>
        )}
        {(booking.status === "CONFIRMED" || booking.status === "ARRIVED") && (
          <Button size="sm" loading={start.isPending} disabled={busy} onClick={() => run(() => start.mutateAsync(booking.id))}>
            <PlayCircle className="size-4" aria-hidden /> Boshladi
          </Button>
        )}
        {booking.status === "IN_PROGRESS" && (
          <Button size="sm" loading={complete.isPending} disabled={busy} onClick={() => run(() => complete.mutateAsync(booking.id))}>
            <CheckCircle2 className="size-4" aria-hidden /> Yakunladi
          </Button>
        )}
        {(booking.status === "CONFIRMED" || booking.status === "ARRIVED") && (
          <Button
            size="sm"
            variant="outline"
            className="border-danger text-danger hover:bg-danger/10"
            loading={noShow.isPending}
            disabled={busy}
            onClick={() => run(() => noShow.mutateAsync(booking.id))}
          >
            <UserX className="size-4" aria-hidden /> Kelmadi
          </Button>
        )}
        {booking.status === "COMPLETED" && !isPaid && (
          <Button size="sm" loading={recordCash.isPending} disabled={busy} onClick={() => run(() => recordCash.mutateAsync(booking.id))}>
            <Banknote className="size-4" aria-hidden /> Naqd qabul qilindi
          </Button>
        )}
        {booking.status === "COMPLETED" && isPaid && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="size-4" aria-hidden /> To&apos;landi
          </span>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
