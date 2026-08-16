import type { BookingStatus, Prisma, Role } from "@prisma/client";
import { Prisma as PrismaClient } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";
import { calculateDeposit, roundMoney, toNumber } from "../utils/money";
import { addDays, minutesBetween } from "../utils/time";
import { assertSlotAvailable, lockBarberSlot } from "./availability.service";
import {
  computeDiscountedPrice,
  createBarberLateCoupon,
  markCouponUsed,
  validateCouponForBooking,
} from "./coupon.service";
import { createNotification } from "./notification.service";
import { getSettings } from "./settings.service";
import { writeAudit } from "./audit.service";

const TERMINAL_STATUSES: BookingStatus[] = ["CANCELLED", "NO_SHOW", "COMPLETED"];

const bookingInclude = {
  salon: { select: { id: true, name: true, ownerId: true } },
  barber: { select: { id: true, userId: true } },
  service: { select: { id: true, name: true, durationMinutes: true } },
  client: { select: { id: true, email: true, firstName: true, lastName: true } },
  payments: true,
  coupon: true,
  review: { select: { id: true } },
} satisfies Prisma.BookingInclude;

export interface CreateBookingInput {
  clientId: string;
  salonId: string;
  barberId: string;
  serviceId: string;
  startAt: Date;
  couponId?: string;
}

export interface ListBookingsQuery {
  userId: string;
  role: Role;
  barberProfileId?: string;
  ownerProfileId?: string;
  status?: BookingStatus;
  salonId?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
}

function serializeBooking<T extends { price: unknown; depositAmount: unknown; remainingAmount: unknown }>(
  booking: T,
) {
  return {
    ...booking,
    price: toNumber(booking.price as never),
    depositAmount: toNumber(booking.depositAmount as never),
    remainingAmount: toNumber(booking.remainingAmount as never),
  };
}

export async function createBooking(input: CreateBookingInput) {
  const client = await prisma.user.findUnique({ where: { id: input.clientId } });
  if (!client) throw AppError.notFound("Client not found");
  if (client.restrictedUntil && client.restrictedUntil > new Date()) {
    throw AppError.forbidden("Booking restricted due to no-shows", ERROR_CODES.USER_RESTRICTED);
  }

  const salon = await prisma.salon.findUnique({ where: { id: input.salonId } });
  if (!salon) throw AppError.notFound("Salon not found");
  if (salon.status !== "ACTIVE") {
    throw AppError.badRequest("Salon is not active", ERROR_CODES.SALON_NOT_ACTIVE);
  }

  const staff = await prisma.salonStaff.findUnique({
    where: { salonId_barberId: { salonId: input.salonId, barberId: input.barberId } },
  });
  if (!staff || staff.status !== "ACTIVE") {
    throw AppError.badRequest("Barber is not in this salon", ERROR_CODES.BARBER_NOT_IN_SALON);
  }

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, salonId: input.salonId },
  });
  if (!service) throw AppError.notFound("Service not found");
  if (!service.isActive) {
    throw AppError.badRequest("Service is inactive", ERROR_CODES.SERVICE_INACTIVE);
  }

  const barberService = await prisma.barberService.findUnique({
    where: { barberId_serviceId: { barberId: input.barberId, serviceId: input.serviceId } },
  });
  if (!barberService) {
    throw AppError.badRequest("Barber does not offer this service", ERROR_CODES.SERVICE_NOT_OFFERED);
  }

  const endAt = new Date(input.startAt.getTime() + service.durationMinutes * 60_000);
  const slotInput = {
    salonId: input.salonId,
    barberId: input.barberId,
    startAt: input.startAt,
    endAt,
  };

  await assertSlotAvailable(slotInput);

  let couponRecord: Awaited<ReturnType<typeof validateCouponForBooking>> | null = null;
  if (input.couponId) {
    couponRecord = await validateCouponForBooking(input.couponId, input.clientId, input.salonId);
  }

  const basePrice = toNumber(service.price);
  const finalPrice = couponRecord
    ? computeDiscountedPrice(basePrice, couponRecord)
    : basePrice;
  const { depositAmount, remainingAmount } = calculateDeposit(
    finalPrice,
    salon.depositType,
    toNumber(salon.depositValue),
  );

  const booking = await prisma.$transaction(
    async (tx) => {
      await lockBarberSlot(slotInput, tx);
      await assertSlotAvailable(slotInput, tx);

      const created = await tx.booking.create({
        data: {
          clientId: input.clientId,
          salonId: input.salonId,
          barberId: input.barberId,
          serviceId: input.serviceId,
          startAt: input.startAt,
          endAt,
          scheduledStartAt: input.startAt,
          price: roundMoney(finalPrice),
          depositAmount: roundMoney(depositAmount),
          remainingAmount: roundMoney(remainingAmount),
          couponId: input.couponId,
          // Cash-only shop: no online prepayment gate, so a booking reserves
          // the slot and is confirmed immediately. Payment is collected in
          // person and recorded by staff via POST /payments (method: CASH).
          status: "CONFIRMED",
        },
        include: bookingInclude,
      });

      if (couponRecord) {
        await markCouponUsed(couponRecord.id, tx);
      }

      return created;
    },
    { isolationLevel: PrismaClient.TransactionIsolationLevel.Serializable },
  );

  await createNotification({
    userId: input.clientId,
    type: "BOOKING_CONFIRMED",
    title: "Booking confirmed",
    body: `Your booking at ${salon.name} is confirmed. Pay in cash at the salon.`,
    data: { bookingId: booking.id },
  });

  const barberUser = await prisma.barberProfile.findUnique({
    where: { id: input.barberId },
    select: { userId: true },
  });
  if (barberUser) {
    await createNotification({
      userId: barberUser.userId,
      type: "BOOKING_CREATED",
      title: "New booking",
      body: `New booking scheduled for ${input.startAt.toISOString()}.`,
      data: { bookingId: booking.id },
    });
  }

  return serializeBooking(booking);
}

export interface QuoteBookingInput {
  clientId: string;
  salonId: string;
  serviceId: string;
  couponId?: string;
}

/**
 * Same price/deposit math as createBooking, without writing a Booking row —
 * lets the client show an accurate summary before the user confirms,
 * instead of reimplementing the deposit/coupon formulas on the frontend.
 */
export async function quoteBookingPrice(input: QuoteBookingInput) {
  const salon = await prisma.salon.findUnique({ where: { id: input.salonId } });
  if (!salon) throw AppError.notFound("Salon not found");
  if (salon.status !== "ACTIVE") {
    throw AppError.badRequest("Salon is not active", ERROR_CODES.SALON_NOT_ACTIVE);
  }

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, salonId: input.salonId },
  });
  if (!service) throw AppError.notFound("Service not found");
  if (!service.isActive) {
    throw AppError.badRequest("Service is inactive", ERROR_CODES.SERVICE_INACTIVE);
  }

  let couponRecord: Awaited<ReturnType<typeof validateCouponForBooking>> | null = null;
  if (input.couponId) {
    couponRecord = await validateCouponForBooking(input.couponId, input.clientId, input.salonId);
  }

  const basePrice = toNumber(service.price);
  const finalPrice = couponRecord ? computeDiscountedPrice(basePrice, couponRecord) : basePrice;
  const { depositAmount, remainingAmount } = calculateDeposit(
    finalPrice,
    salon.depositType,
    toNumber(salon.depositValue),
  );

  return {
    price: roundMoney(finalPrice),
    depositAmount: roundMoney(depositAmount),
    remainingAmount: roundMoney(remainingAmount),
    couponApplied: Boolean(couponRecord),
  };
}

export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });
  if (!booking) throw AppError.notFound("Booking not found");
  return serializeBooking(booking);
}

export async function listBookings(query: ListBookingsQuery) {
  const where: Prisma.BookingWhereInput = {};

  if (query.role === "CLIENT") {
    where.clientId = query.userId;
  } else if (query.role === "BARBER" && query.barberProfileId) {
    where.barberId = query.barberProfileId;
  } else if (query.role === "OWNER" && query.ownerProfileId) {
    where.salon = { ownerId: query.ownerProfileId };
  }

  if (query.status) where.status = query.status;
  if (query.salonId) where.salonId = query.salonId;
  if (query.from || query.to) {
    where.startAt = {};
    if (query.from) where.startAt.gte = query.from;
    if (query.to) where.startAt.lte = query.to;
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { startAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: items.map(serializeBooking),
    page: query.page,
    limit: query.limit,
    total,
  };
}

function assertStatus(booking: { status: BookingStatus }, allowed: BookingStatus[]) {
  if (!allowed.includes(booking.status)) {
    throw AppError.badRequest(
      `Invalid booking status: ${booking.status}`,
      ERROR_CODES.BOOKING_INVALID_STATUS,
    );
  }
}

function assertNotTerminal(booking: { status: BookingStatus }) {
  if (TERMINAL_STATUSES.includes(booking.status)) {
    throw AppError.badRequest("Booking is already closed", ERROR_CODES.BOOKING_INVALID_STATUS);
  }
}

export async function cancelBooking(id: string, actorId: string, reason?: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw AppError.notFound("Booking not found");
  assertNotTerminal(booking);

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelReason: reason,
    },
    include: bookingInclude,
  });

  await createNotification({
    userId: booking.clientId,
    type: "BOOKING_CANCELLED",
    title: "Booking cancelled",
    body: reason ?? "Your booking was cancelled.",
    data: { bookingId: id },
  });

  await writeAudit({
    actorId,
    action: "BOOKING_CANCELLED",
    entityType: "Booking",
    entityId: id,
    metadata: { reason },
  });

  return serializeBooking(updated);
}

export async function arriveBooking(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw AppError.notFound("Booking not found");
  assertStatus(booking, ["CONFIRMED"]);

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "ARRIVED" },
    include: bookingInclude,
  });

  await createNotification({
    userId: booking.clientId,
    type: "BOOKING_CONFIRMED",
    title: "Arrived",
    body: "You have been marked as arrived.",
    data: { bookingId: id },
  });

  return serializeBooking(updated);
}

export async function startBooking(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw AppError.notFound("Booking not found");
  assertStatus(booking, ["CONFIRMED", "ARRIVED"]);

  const now = new Date();
  const delayMinutes = minutesBetween(now, booking.scheduledStartAt);
  const settings = await getSettings();

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      actualStartAt: now,
      delayMinutes,
    },
    include: bookingInclude,
  });

  await createNotification({
    userId: booking.clientId,
    type: "BARBER_STARTED",
    title: "Service started",
    body: "Your barber has started the service.",
    data: { bookingId: id, delayMinutes },
  });

  await writeAudit({
    action: "BOOKING_STARTED",
    entityType: "Booking",
    entityId: id,
    metadata: { delayMinutes },
  });

  if (delayMinutes > settings.barberDelayThreshold) {
    const coupon = await createBarberLateCoupon({
      clientId: booking.clientId,
      salonId: booking.salonId,
      sourceBookingId: booking.id,
      percent: toNumber(settings.barberDelayCompensationPercent),
    });

    await createNotification({
      userId: booking.clientId,
      type: "BARBER_DELAYED",
      title: "Barber delayed",
      body: `Your barber was ${delayMinutes} minutes late. A compensation coupon was issued.`,
      data: { bookingId: id, delayMinutes, couponId: coupon.id },
    });

    await createNotification({
      userId: booking.clientId,
      type: "COUPON_RECEIVED",
      title: "Compensation coupon",
      body: `You received a ${toNumber(settings.barberDelayCompensationPercent)}% discount coupon.`,
      data: { couponId: coupon.id, bookingId: id },
    });

    await writeAudit({
      action: "COUPON_CREATED",
      entityType: "Coupon",
      entityId: coupon.id,
      metadata: { reason: "BARBER_LATE", bookingId: id, delayMinutes },
    });
  }

  return serializeBooking(updated);
}

export async function completeBooking(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw AppError.notFound("Booking not found");
  assertStatus(booking, ["IN_PROGRESS"]);

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "COMPLETED",
      actualEndAt: new Date(),
    },
    include: bookingInclude,
  });

  await createNotification({
    userId: booking.clientId,
    type: "REVIEW_AVAILABLE",
    title: "Leave a review",
    body: "Your visit is complete. Share your experience!",
    data: { bookingId: id },
  });

  await writeAudit({
    action: "BOOKING_COMPLETED",
    entityType: "Booking",
    entityId: id,
  });

  return serializeBooking(updated);
}

export async function markNoShow(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw AppError.notFound("Booking not found");
  assertStatus(booking, ["CONFIRMED", "ARRIVED"]);

  const settings = await getSettings();

  const [updated, client] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: "NO_SHOW" },
      include: bookingInclude,
    }),
    prisma.user.update({
      where: { id: booking.clientId },
      data: { noShowCount: { increment: 1 } },
    }),
  ]);

  const newCount = client.noShowCount;
  let restrictedUntil: Date | null = null;

  if (newCount >= settings.noShowLimit) {
    restrictedUntil = addDays(new Date(), settings.noShowRestrictionDays);
    await prisma.user.update({
      where: { id: booking.clientId },
      data: { restrictedUntil },
    });

    await createNotification({
      userId: booking.clientId,
      type: "BOOKING_RESTRICTION",
      title: "Booking restricted",
      body: `You reached ${settings.noShowLimit} no-shows. Booking is restricted for ${settings.noShowRestrictionDays} days.`,
      data: { restrictedUntil: restrictedUntil.toISOString(), noShowCount: newCount },
    });
  } else {
    await createNotification({
      userId: booking.clientId,
      type: "NO_SHOW_WARNING",
      title: "No-show recorded",
      body: `No-show ${newCount}/${settings.noShowLimit}. Further no-shows may restrict booking.`,
      data: { noShowCount: newCount, limit: settings.noShowLimit },
    });
  }

  await writeAudit({
    action: "NO_SHOW",
    entityType: "Booking",
    entityId: id,
    metadata: {
      clientId: booking.clientId,
      noShowCount: newCount,
      restrictedUntil,
    },
  });

  return serializeBooking(updated);
}

export async function confirmBookingAfterDeposit(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return;
  if (booking.status !== "PENDING") return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  await createNotification({
    userId: booking.clientId,
    type: "BOOKING_CONFIRMED",
    title: "Booking confirmed",
    body: "Deposit received. Your booking is confirmed.",
    data: { bookingId },
  });
}
