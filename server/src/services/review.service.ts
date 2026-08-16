import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";
import { writeAudit } from "./audit.service";
import { getSettings } from "./settings.service";

async function recalculateBarberRating(barberId: string) {
  const agg = await prisma.review.aggregate({
    where: { barberId, isHidden: false },
    _avg: { barberRating: true },
    _count: true,
  });
  await prisma.barberProfile.update({
    where: { id: barberId },
    data: {
      rating: agg._avg.barberRating ?? 0,
      reviewCount: agg._count,
    },
  });
}

async function recalculateSalonRating(salonId: string) {
  const agg = await prisma.review.aggregate({
    where: { salonId, isHidden: false },
    _avg: { salonRating: true },
    _count: true,
  });
  await prisma.salon.update({
    where: { id: salonId },
    data: {
      rating: agg._avg.salonRating ?? 0,
      reviewCount: agg._count,
    },
  });
}

export async function createReview(params: {
  clientId: string;
  bookingId: string;
  barberRating: number;
  salonRating: number;
  serviceRating: number;
  comment?: string;
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { review: true },
  });

  if (!booking) throw AppError.notFound("Booking not found");
  if (booking.clientId !== params.clientId) {
    throw AppError.forbidden("Booking does not belong to you");
  }
  if (booking.status !== "COMPLETED") {
    throw AppError.badRequest("Only completed bookings can be reviewed", ERROR_CODES.REVIEW_NOT_ALLOWED);
  }
  if (booking.review) {
    throw AppError.conflict("Review already exists for this booking", ERROR_CODES.REVIEW_EXISTS);
  }

  const review = await prisma.review.create({
    data: {
      bookingId: params.bookingId,
      clientId: params.clientId,
      salonId: booking.salonId,
      barberId: booking.barberId,
      serviceId: booking.serviceId,
      barberRating: params.barberRating,
      salonRating: params.salonRating,
      serviceRating: params.serviceRating,
      comment: params.comment,
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await Promise.all([
    recalculateBarberRating(booking.barberId),
    recalculateSalonRating(booking.salonId),
  ]);

  await writeAudit({
    actorId: params.clientId,
    action: "REVIEW_CREATED",
    entityType: "Review",
    entityId: review.id,
    metadata: { bookingId: params.bookingId },
  });

  return review;
}

export async function updateReview(params: {
  reviewId: string;
  clientId: string;
  barberRating?: number;
  salonRating?: number;
  serviceRating?: number;
  comment?: string | null;
}) {
  const review = await prisma.review.findUnique({ where: { id: params.reviewId } });
  if (!review) throw AppError.notFound("Review not found");
  if (review.clientId !== params.clientId) {
    throw AppError.forbidden("You can only edit your own reviews");
  }
  if (review.isHidden) {
    throw AppError.badRequest("Hidden reviews cannot be edited", ERROR_CODES.REVIEW_NOT_ALLOWED);
  }

  const settings = await getSettings();
  const editDeadline = new Date(review.createdAt);
  editDeadline.setHours(editDeadline.getHours() + settings.reviewEditWindow);
  if (new Date() > editDeadline) {
    throw AppError.badRequest("Review edit window has expired", ERROR_CODES.REVIEW_NOT_ALLOWED);
  }

  const data: Prisma.ReviewUpdateInput = {};
  if (params.barberRating !== undefined) data.barberRating = params.barberRating;
  if (params.salonRating !== undefined) data.salonRating = params.salonRating;
  if (params.serviceRating !== undefined) data.serviceRating = params.serviceRating;
  if (params.comment !== undefined) data.comment = params.comment;

  const updated = await prisma.review.update({
    where: { id: params.reviewId },
    data,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await Promise.all([
    recalculateBarberRating(review.barberId),
    recalculateSalonRating(review.salonId),
  ]);

  await writeAudit({
    actorId: params.clientId,
    action: "REVIEW_UPDATED",
    entityType: "Review",
    entityId: review.id,
  });

  return updated;
}

export async function listSalonReviews(salonId: string, page: number, limit: number, includeHidden = false) {
  const where: Prisma.ReviewWhereInput = { salonId };
  if (!includeHidden) where.isHidden = false;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { items, page, limit, total };
}

export async function listBarberReviews(barberId: string, page: number, limit: number, includeHidden = false) {
  const where: Prisma.ReviewWhereInput = { barberId };
  if (!includeHidden) where.isHidden = false;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { items, page, limit, total };
}

export async function hideReview(reviewId: string, actorId: string) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isHidden: true, hiddenAt: new Date() },
  });

  await Promise.all([
    recalculateBarberRating(review.barberId),
    recalculateSalonRating(review.salonId),
  ]);

  await writeAudit({
    actorId,
    action: "REVIEW_REMOVED",
    entityType: "Review",
    entityId: reviewId,
  });

  return review;
}

export async function restoreReview(reviewId: string, actorId: string) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isHidden: false, hiddenAt: null },
  });

  await Promise.all([
    recalculateBarberRating(review.barberId),
    recalculateSalonRating(review.salonId),
  ]);

  await writeAudit({
    actorId,
    action: "REVIEW_RESTORED",
    entityType: "Review",
    entityId: reviewId,
  });

  return review;
}
