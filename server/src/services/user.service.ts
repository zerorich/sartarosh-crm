import type { User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

/** Mirrors auth.service's sanitizeUser (kept local to avoid touching that module). */
function sanitizeUser(user: User) {
  return {
    id: user.id,
    phone: user.phone,
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
  return sanitizeUser(user);
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
