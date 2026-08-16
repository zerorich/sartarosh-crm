import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { getSettings } from "./settings.service";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";
import { applyCoupon, roundMoney, toNumber } from "../utils/money";
import { addDays } from "../utils/time";

type Tx = Prisma.TransactionClient;

export async function validateCouponForBooking(
  couponId: string,
  clientId: string,
  salonId: string,
  tx?: Tx,
) {
  const db = tx ?? prisma;
  const coupon = await db.coupon.findUnique({ where: { id: couponId } });

  if (!coupon) {
    throw AppError.notFound("Coupon not found", ERROR_CODES.COUPON_INVALID);
  }
  if (coupon.clientId !== clientId) {
    throw AppError.forbidden("Coupon does not belong to you", ERROR_CODES.COUPON_INVALID);
  }
  if (coupon.salonId !== salonId) {
    throw AppError.badRequest("Coupon is not valid for this salon", ERROR_CODES.COUPON_INVALID);
  }
  if (coupon.usedAt) {
    throw AppError.badRequest("Coupon already used", ERROR_CODES.COUPON_INVALID);
  }
  if (coupon.expiresAt <= new Date()) {
    throw AppError.badRequest("Coupon expired", ERROR_CODES.COUPON_EXPIRED);
  }

  return coupon;
}

export function computeDiscountedPrice(
  basePrice: number,
  coupon: { type: "PERCENTAGE" | "FIXED"; value: { toNumber?: () => number } | number | string },
): number {
  const value = toNumber(coupon.value as never);
  return applyCoupon(basePrice, coupon.type, value);
}

export async function createBarberLateCoupon(
  params: {
    clientId: string;
    salonId: string;
    sourceBookingId: string;
    percent: number;
  },
  tx?: Tx,
) {
  const db = tx ?? prisma;
  const settings = await getSettings();
  const existing = await db.coupon.findFirst({
    where: { bookingId: params.sourceBookingId, reason: "BARBER_LATE" },
  });
  if (existing) return existing;

  return db.coupon.create({
    data: {
      clientId: params.clientId,
      salonId: params.salonId,
      bookingId: params.sourceBookingId,
      reason: "BARBER_LATE",
      type: "PERCENTAGE",
      value: roundMoney(params.percent),
      expiresAt: addDays(new Date(), settings.couponExpirationDays),
    },
  });
}

export async function markCouponUsed(couponId: string, tx?: Tx) {
  const db = tx ?? prisma;
  return db.coupon.update({
    where: { id: couponId },
    data: { usedAt: new Date() },
  });
}
