import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

function sanitizeUser(user: {
  id: string;
  phone: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;
  noShowCount: number;
  restrictedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
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

export async function getMyProfile(userId: string) {
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

export async function updateMyProfile(userId: string, input: UpdateProfileInput) {
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
