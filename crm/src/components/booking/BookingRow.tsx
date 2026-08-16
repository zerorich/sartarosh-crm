import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { BookingActions } from "./BookingActions";
import { formatDateWithWeekday, formatMoney, formatTime, fullName } from "@/lib/utils";
import type { Booking } from "@/types/booking";

export function BookingRow({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/bookings/${booking.id}`} className="text-sm font-semibold hover:underline">
            {fullName(booking.client) || booking.client.email}
          </Link>
          <p className="text-xs text-muted">{booking.service.name}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Calendar className="size-3.5" aria-hidden />
          {formatDateWithWeekday(booking.startAt)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {formatTime(booking.startAt)}
        </span>
        <span className="font-medium text-foreground">{formatMoney(booking.price)}</span>
      </div>
      <BookingActions booking={booking} />
    </div>
  );
}
