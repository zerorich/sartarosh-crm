import type { Prisma, Role, SalonStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { toNumber } from "../utils/money";
import { writeAudit } from "./audit.service";
import { getSettings, updateSettings } from "./settings.service";
import { hideReview, restoreReview } from "./review.service";

export async function listUsers(params: {
  page: number;
  limit: number;
  role?: Role;
  search?: string;
}) {
  const where: Prisma.UserWhereInput = {};
  if (params.role) where.role = params.role;
  if (params.search) {
    where.OR = [
      { phone: { contains: params.search } },
      { firstName: { contains: params.search, mode: "insensitive" } },
      { lastName: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      select: {
        id: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        isBlocked: true,
        blockedAt: true,
        noShowCount: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      role: true,
      firstName: true,
      lastName: true,
      isBlocked: true,
      blockedAt: true,
      blockReason: true,
      noShowCount: true,
      restrictedUntil: true,
      createdAt: true,
      updatedAt: true,
      clientProfile: { select: { id: true } },
      barberProfile: { select: { id: true, rating: true, reviewCount: true } },
      ownerProfile: { select: { id: true } },
    },
  });

  if (!user) throw AppError.notFound("User not found");
  return user;
}

export async function blockUser(params: {
  userId: string;
  actorId: string;
  reason?: string;
  block: boolean;
}) {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) throw AppError.notFound("User not found");
  if (user.role === "SUPER_ADMIN") {
    throw AppError.forbidden("Cannot block super admin");
  }

  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: params.block
      ? { isBlocked: true, blockedAt: new Date(), blockReason: params.reason }
      : { isBlocked: false, blockedAt: null, blockReason: null },
  });

  if (params.block) {
    await writeAudit({
      actorId: params.actorId,
      action: "USER_BLOCKED",
      entityType: "User",
      entityId: params.userId,
      metadata: { reason: params.reason },
    });
  } else {
    await writeAudit({
      actorId: params.actorId,
      action: "USER_UNBLOCKED",
      entityType: "User",
      entityId: params.userId,
    });
  }

  return updated;
}

export async function listSalons(params: {
  page: number;
  limit: number;
  status?: SalonStatus;
}) {
  const where: Prisma.SalonWhereInput = {};
  if (params.status) where.status = params.status;

  const [items, total] = await Promise.all([
    prisma.salon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        owner: {
          include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } } },
        },
      },
    }),
    prisma.salon.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function approveSalon(salonId: string, actorId: string) {
  const salon = await prisma.salon.update({
    where: { id: salonId },
    data: { status: "ACTIVE", rejectReason: null },
  });

  await writeAudit({
    actorId,
    action: "SALON_APPROVED",
    entityType: "Salon",
    entityId: salonId,
  });

  return salon;
}

export async function rejectSalon(salonId: string, actorId: string, reason: string) {
  const salon = await prisma.salon.update({
    where: { id: salonId },
    data: { status: "REJECTED", rejectReason: reason },
  });

  await writeAudit({
    actorId,
    action: "SALON_REJECTED",
    entityType: "Salon",
    entityId: salonId,
    metadata: { reason },
  });

  return salon;
}

export async function blockSalon(salonId: string, actorId: string, reason?: string) {
  const salon = await prisma.salon.update({
    where: { id: salonId },
    data: { status: "BLOCKED", rejectReason: reason },
  });

  await writeAudit({
    actorId,
    action: "SALON_BLOCKED",
    entityType: "Salon",
    entityId: salonId,
    metadata: { reason },
  });

  return salon;
}

export async function listBookings(params: { page: number; limit: number; status?: string; salonId?: string }) {
  const where: Prisma.BookingWhereInput = {};
  if (params.status) where.status = params.status as Prisma.EnumBookingStatusFilter["equals"];
  if (params.salonId) where.salonId = params.salonId;

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        client: { select: { id: true, phone: true, firstName: true, lastName: true } },
        salon: { select: { id: true, name: true } },
        barber: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        service: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function listPayments(params: { page: number; limit: number; status?: string }) {
  const where: Prisma.PaymentWhereInput = {};
  if (params.status) where.status = params.status as Prisma.EnumPaymentStatusFilter["equals"];

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        booking: {
          select: {
            id: true,
            salon: { select: { id: true, name: true } },
            client: { select: { id: true, phone: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function listReviews(params: { page: number; limit: number; includeHidden?: boolean }) {
  const where: Prisma.ReviewWhereInput = {};
  if (!params.includeHidden) where.isHidden = false;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        salon: { select: { id: true, name: true } },
        barber: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function getSalonById(salonId: string) {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    include: {
      owner: {
        include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } } },
      },
      _count: {
        select: { staff: true, bookings: true, reviews: true, services: true },
      },
    },
  });

  if (!salon) throw AppError.notFound("Salon not found");
  return salon;
}

export async function getBookingById(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: { select: { id: true, phone: true, firstName: true, lastName: true, avatarUrl: true } },
      salon: { select: { id: true, name: true, address: true, phone: true } },
      barber: { include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } } } },
      service: { select: { id: true, name: true, durationMinutes: true, price: true } },
      payments: true,
      coupon: true,
    },
  });

  if (!booking) throw AppError.notFound("Booking not found");
  return booking;
}

export async function listBarbers(params: {
  page: number;
  limit: number;
  search?: string;
  salonId?: string;
}) {
  const where: Prisma.BarberProfileWhereInput = {};

  if (params.search) {
    where.user = {
      OR: [
        { firstName: { contains: params.search, mode: "insensitive" } },
        { lastName: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search } },
      ],
    };
  }

  if (params.salonId) {
    where.staffAssignments = { some: { salonId: params.salonId, status: "ACTIVE" } };
  }

  const [items, total] = await Promise.all([
    prisma.barberProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        user: { select: { id: true, phone: true, firstName: true, lastName: true, avatarUrl: true, isBlocked: true } },
        staffAssignments: {
          where: { status: "ACTIVE" },
          include: { salon: { select: { id: true, name: true } } },
        },
        _count: { select: { bookings: true, reviews: true } },
      },
    }),
    prisma.barberProfile.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function getBarberById(barberId: string) {
  const barber = await prisma.barberProfile.findUnique({
    where: { id: barberId },
    include: {
      user: { select: { id: true, phone: true, firstName: true, lastName: true, avatarUrl: true, isBlocked: true, createdAt: true } },
      staffAssignments: {
        where: { status: "ACTIVE" },
        include: { salon: { select: { id: true, name: true } } },
      },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  if (!barber) throw AppError.notFound("Barber not found");
  return barber;
}

export async function deleteReview(reviewId: string, actorId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw AppError.notFound("Review not found");

  await prisma.review.delete({ where: { id: reviewId } });

  await writeAudit({
    actorId,
    action: "REVIEW_REMOVED",
    entityType: "Review",
    entityId: reviewId,
    metadata: { permanent: true },
  });

  return review;
}

export async function getReports() {
  const [
    userCounts,
    salonCounts,
    bookingCounts,
    paymentSum,
    complaintCounts,
    recentAudit,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.salon.groupBy({ by: ["status"], _count: true }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    prisma.complaint.groupBy({ by: ["status"], _count: true }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { actor: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
  ]);

  return {
    users: userCounts.map((r) => ({ role: r.role, count: r._count })),
    salons: salonCounts.map((r) => ({ status: r.status, count: r._count })),
    bookings: bookingCounts.map((r) => ({ status: r.status, count: r._count })),
    payments: {
      count: paymentSum._count,
      totalAmount: toNumber(paymentSum._sum.amount ?? 0),
    },
    complaints: complaintCounts.map((r) => ({ status: r.status, count: r._count })),
    recentAudit,
  };
}

export async function getAdminSettings() {
  return getSettings();
}

export async function patchAdminSettings(actorId: string, data: Record<string, unknown>) {
  const updated = await updateSettings(data as Parameters<typeof updateSettings>[0]);

  await writeAudit({
    actorId,
    action: "SETTINGS_UPDATED",
    entityType: "AdminSetting",
    entityId: updated.id,
    metadata: data as Prisma.InputJsonValue,
  });

  return updated;
}

export { hideReview, restoreReview };
