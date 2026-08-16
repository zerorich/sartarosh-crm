import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

const LABELS: Record<BookingStatus, string> = {
  PENDING: "To'lov kutilmoqda",
  CONFIRMED: "Tasdiqlangan",
  ARRIVED: "Keldi",
  IN_PROGRESS: "Xizmat ko'rsatilmoqda",
  COMPLETED: "Yakunlangan",
  CANCELLED: "Bekor qilingan",
  NO_SHOW: "Kelmadi",
};

const CLASSES: Record<BookingStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  CONFIRMED: "bg-success/10 text-success",
  ARRIVED: "bg-success/10 text-success",
  IN_PROGRESS: "bg-accent/10 text-accent",
  COMPLETED: "bg-surface-muted text-foreground",
  CANCELLED: "bg-danger/10 text-danger",
  NO_SHOW: "bg-danger/10 text-danger",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", CLASSES[status])}>
      {LABELS[status]}
    </span>
  );
}
