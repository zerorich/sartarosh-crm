export type CouponType = "PERCENTAGE" | "FIXED";
export type CouponReason = "BARBER_LATE" | "ADMIN" | "PROMOTION";

export interface Coupon {
  id: string;
  clientId: string;
  salonId: string;
  bookingId: string | null;
  reason: CouponReason;
  type: CouponType;
  value: number | string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}
