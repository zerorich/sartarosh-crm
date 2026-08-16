"use client";

import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types/coupon";

interface CouponBannerProps {
  coupons: Coupon[];
  selectedId: string | null;
  onSelect: (couponId: string | null) => void;
}

/** Faol (muddati o'tmagan, ishlatilmagan) kuponlar — /users/me/coupons dan keladi. */
export function CouponBanner({ coupons, selectedId, onSelect }: CouponBannerProps) {
  if (coupons.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Gift className="size-4 text-accent" aria-hidden />
        Sizda faol kupon bor
      </p>
      <div className="flex flex-col gap-2">
        {coupons.map((coupon) => {
          const active = coupon.id === selectedId;
          return (
            <button
              key={coupon.id}
              onClick={() => onSelect(active ? null : coupon.id)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left text-sm transition-colors",
                active ? "border-accent bg-accent/5" : "border-border hover:bg-surface-muted",
              )}
            >
              <span>
                {String(coupon.value)}
                {coupon.type === "PERCENTAGE" ? "%" : " so'm"} chegirma
              </span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", active ? "bg-accent text-white" : "bg-surface-muted text-muted")}>
                {active ? "Qo'llanildi" : "Qo'llash"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
