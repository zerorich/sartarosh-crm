import type { User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

/** Mirrors auth.service's sanitizeUser (kept local to avoid touching that module). */
function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    isBlocked: user.isBlocked,
    noShowCount: user.noShowCount,
    restrictedUntil: user.restrictedUntil,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User not found");

  const [totalBookings, completedBookings, reviewsCount] = await Promise.all([
    prisma.booking.count({ where: { clientId: userId } }),
    prisma.booking.count({ where: { clientId: userId, status: "COMPLETED" } }),
    prisma.review.count({ where: { clientId: userId } }),
  ]);

  return {
    ...sanitizeUser(user),
    stats: {
      totalBookings,
      completedBookings,
      reviewsCount,
      memberSince: user.createdAt,
    },
  };
}

export interface UpdateMeInput {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

export async function updateMe(userId: string, input: UpdateMeInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
  });
  return sanitizeUser(user);
}

export async function getMyReviews(clientId: string) {
  return prisma.review.findMany({
    where: { clientId, isHidden: false },
    orderBy: { createdAt: "desc" },
    include: {
      salon: { select: { id: true, name: true } },
      barber: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      service: { select: { id: true, name: true } },
    },
  });
}

export async function getMyCoupons(clientId: string) {
  return prisma.coupon.findMany({
    where: { clientId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSavedSalons(clientId: string) {
  const saved = await prisma.savedSalon.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: { salon: true },
  });
  return saved.map(({ salon: { ownerId: _ownerId, rejectReason: _rejectReason, ...salon } }) => salon);
}

export async function saveSalon(clientId: string, salonId: string) {
  const salon = await prisma.salon.findUnique({ where: { id: salonId }, select: { id: true } });
  if (!salon) throw AppError.notFound("Salon not found");

  await prisma.savedSalon.upsert({
    where: { clientId_salonId: { clientId, salonId } },
    create: { clientId, salonId },
    update: {},
  });
  return { salonId, saved: true };
}

export async function unsaveSalon(clientId: string, salonId: string) {
  await prisma.savedSalon.deleteMany({ where: { clientId, salonId } });
  return { salonId, saved: false };
}
