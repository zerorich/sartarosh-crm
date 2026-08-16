import { Clock3, Gift } from "lucide-react";
import type { Coupon } from "@/types/coupon";

interface DelayNoticeProps {
  delayMinutes: number;
  coupon?: Coupon | null;
}

/** Backend qaytargan delayMinutes/coupon'ni ko'rsatadi — chegara/foiz frontendda hardcode qilinmagan. */
export function DelayNotice({ delayMinutes, coupon }: DelayNoticeProps) {
  if (delayMinutes <= 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-warning/10 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-warning">
        <Clock3 className="size-4 shrink-0" aria-hidden />
        Sartarosh belgilangan vaqtdan {delayMinutes} daqiqa kechikdi.
      </div>
      {coupon && (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Gift className="size-4 shrink-0 text-accent" aria-hidden />
          Keyingi tashrifingiz uchun {String(coupon.value)}
          {coupon.type === "PERCENTAGE" ? "%" : " so'm"} chegirma kuponi berildi.
        </div>
      )}
    </div>
  );
}
