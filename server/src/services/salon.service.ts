import type { DepositType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { salonRepository } from "../repositories/salon.repository";
import { workingHourRepository } from "../repositories/working-hour.repository";
import { getSettings } from "./settings.service";
import { AppError } from "../utils/app-error";
import { ERROR_CODES } from "../types";
import { boundingBox, haversineDistanceKm } from "../utils/geo";
import { paginationArgs } from "../utils/pagination";
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "../utils/cache";

export interface CreateSalonInput {
  name: string;
  description?: string;
  address: string;
  city?: string;
  lat: number;
  lng: number;
  phone?: string;
  coverUrl?: string;
  depositType?: DepositType;
  depositValue?: number;
  workingHours?: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
}

export interface UpdateSalonInput {
  name?: string;
  description?: string | null;
  address?: string;
  city?: string | null;
  lat?: number;
  lng?: number;
  phone?: string | null;
  coverUrl?: string | null;
  depositType?: DepositType;
  depositValue?: number;
  workingHours?: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
}

function isOwnerOfSalon(ownerProfileId: string | undefined, salonOwnerId: string) {
  return Boolean(ownerProfileId && ownerProfileId === salonOwnerId);
}

export async function createSalon(ownerProfileId: string, input: CreateSalonInput) {
  const salon = await prisma.$transaction(async (tx) => {
    const created = await tx.salon.create({
      data: {
        name: input.name,
        description: input.description,
        address: input.address,
        city: input.city,
        lat: input.lat,
        lng: input.lng,
        phone: input.phone,
        coverUrl: input.coverUrl,
        depositType: input.depositType,
        depositValue: input.depositValue,
        owner: { connect: { id: ownerProfileId } },
      },
    });

    if (input.workingHours?.length) {
      await tx.workingHour.createMany({
        data: input.workingHours.map((h) => ({
          salonId: created.id,
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
        })),
      });
    }

    return created;
  });

  return salonRepository.findById(salon.id);
}

export async function listSalons(
  page: number,
  limit: number,
  user?: { role: string; ownerProfileId?: string },
) {
  const { skip, take } = paginationArgs(page, limit);

  if (user?.role === "OWNER" && user.ownerProfileId) {
    const where = { ownerId: user.ownerProfileId };
    const [items, total] = await Promise.all([
      salonRepository.findMany(where, skip, take),
      salonRepository.count(where),
    ]);
    return { items, page, limit, total };
  }

  const cacheKey = CACHE_KEYS.salonList(page, limit);
  const cached = await cacheGet<{
    items: Awaited<ReturnType<typeof salonRepository.findMany>>;
    page: number;
    limit: number;
    total: number;
  }>(cacheKey);
  if (cached) return cached;

  const where = { status: "ACTIVE" as const };
  const [items, total] = await Promise.all([
    salonRepository.findMany(where, skip, take),
    salonRepository.count(where),
  ]);
  const result = { items, page, limit, total };
  await cacheSet(cacheKey, result, CACHE_TTL.salonPublic);
  return result;
}

export async function findNearbySalons(lat: number, lng: number, radiusKm?: number) {
  const settings = await getSettings();
  const radius = radiusKm ?? settings.defaultSearchRadius;
  const cacheKey = CACHE_KEYS.salonNearby(lat, lng, radius);
  const cached = await cacheGet<
    Array<Awaited<ReturnType<typeof salonRepository.findInBoundingBox>>[number] & { distanceKm: number }>
  >(cacheKey);
  if (cached) return cached;

  const box = boundingBox(lat, lng, radius);

  const candidates = await salonRepository.findInBoundingBox(
    box.minLat,
    box.maxLat,
    box.minLng,
    box.maxLng,
    "ACTIVE",
  );

  const result = candidates
    .map((salon) => ({
      ...salon,
      distanceKm: Math.round(haversineDistanceKm(lat, lng, salon.lat, salon.lng) * 100) / 100,
    }))
    .filter((s) => s.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  await cacheSet(cacheKey, result, CACHE_TTL.salonPublic);
  return result;
}

export async function getSalonById(
  id: string,
  user?: { role: string; ownerProfileId?: string },
) {
  const salon = await salonRepository.findById(id);
  if (!salon) throw AppError.notFound("Salon not found");

  const isOwner = isOwnerOfSalon(user?.ownerProfileId, salon.ownerId);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (salon.status !== "ACTIVE" && !isOwner && !isAdmin) {
    throw AppError.notFound("Salon not found", ERROR_CODES.SALON_NOT_ACTIVE);
  }

  const { ownerId: _ownerId, rejectReason, ...rest } = salon;
  return {
    ...rest,
    ...(isOwner || isAdmin ? { rejectReason } : {}),
  };
}

export async function updateSalon(id: string, input: UpdateSalonInput) {
  const existing = await salonRepository.findById(id);
  if (!existing) throw AppError.notFound("Salon not found");

  const data: Prisma.SalonUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.address !== undefined) data.address = input.address;
  if (input.city !== undefined) data.city = input.city;
  if (input.lat !== undefined) data.lat = input.lat;
  if (input.lng !== undefined) data.lng = input.lng;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.coverUrl !== undefined) data.coverUrl = input.coverUrl;
  if (input.depositType !== undefined) data.depositType = input.depositType;
  if (input.depositValue !== undefined) data.depositValue = input.depositValue;

  await salonRepository.update(id, data);

  if (input.workingHours) {
    await workingHourRepository.replaceForSalon(id, input.workingHours);
  }

  return getSalonById(id, { role: "OWNER", ownerProfileId: existing.ownerId });
}

export async function deleteSalon(id: string) {
  const existing = await salonRepository.findById(id);
  if (!existing) throw AppError.notFound("Salon not found");

  const hasBookings = await salonRepository.hasBookings(id);
  if (hasBookings) {
    throw AppError.conflict("Cannot delete salon with existing bookings");
  }

  await salonRepository.delete(id);
  return { id, deleted: true };
}

export async function assertSalonAccessible(salonId: string, activeOnly = true) {
  const salon = await salonRepository.findById(salonId);
  if (!salon) throw AppError.notFound("Salon not found");
  if (activeOnly && salon.status !== "ACTIVE") {
    throw AppError.forbidden("Salon is not active", ERROR_CODES.SALON_NOT_ACTIVE);
  }
  return salon;
}
