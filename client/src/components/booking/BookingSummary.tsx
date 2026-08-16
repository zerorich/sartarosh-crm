import { Banknote } from "lucide-react";
import { formatDateWithWeekday, formatMoney, formatTime } from "@/lib/utils";

interface BookingSummaryProps {
  salonName: string;
  barberName: string;
  serviceName: string;
  startAt: string;
  price: number;
  couponLabel?: string | null;
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

export function BookingSummary({
  salonName,
  barberName,
  serviceName,
  startAt,
  price,
  couponLabel,
}: BookingSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <Row label="Salon" value={salonName} />
      <Row label="Sartarosh" value={barberName} />
      <Row label="Xizmat" value={serviceName} />
      <Row label="Sana" value={formatDateWithWeekday(startAt)} />
      <Row label="Vaqt" value={formatTime(startAt)} />
      <div className="my-1 border-t border-border" />
      {couponLabel && <Row label="Kupon" value={couponLabel} />}
      <Row label="Narx" value={formatMoney(price)} strong />
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-muted p-3 text-xs text-muted">
        <Banknote className="size-4 shrink-0 text-success" aria-hidden />
        To&apos;lov naqd pulda, salonda xizmatdan so&apos;ng amalga oshiriladi.
      </div>
    </div>
  );
}
