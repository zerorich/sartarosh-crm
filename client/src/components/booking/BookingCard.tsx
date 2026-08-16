import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { formatDateWithWeekday, formatMoney, formatTime } from "@/lib/utils";
import type { Booking } from "@/types/booking";

export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all active:scale-[0.98] hover:border-foreground/15 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight">{booking.salon.name}</p>
          <p className="truncate text-xs text-muted">{booking.service.name}</p>
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
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2.5 text-sm">
        <span className="text-muted">Umumiy narx</span>
        <span className="font-semibold text-foreground">{formatMoney(booking.price)}</span>
      </div>
    </Link>
  );
}
