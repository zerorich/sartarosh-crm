import type { Prisma, SalonStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

const publicSelect = {
  id: true,
  name: true,
  description: true,
  address: true,
  city: true,
  lat: true,
  lng: true,
  phone: true,
  coverUrl: true,
  status: true,
  rating: true,
  reviewCount: true,
  depositType: true,
  depositValue: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SalonSelect;

export function searchWhere(search: string): Prisma.SalonWhereInput {
  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ],
  };
}

export const salonRepository = {
  create(data: Prisma.SalonCreateInput) {
    return prisma.salon.create({ data, select: publicSelect });
  },

  findById(id: string) {
    return prisma.salon.findUnique({
      where: { id },
      select: {
        ...publicSelect,
        ownerId: true,
        rejectReason: true,
        workingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        blockedTimes: {
          where: { endAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
        },
      },
    });
  },

  findMany(where: Prisma.SalonWhereInput, skip: number, take: number) {
    return prisma.salon.findMany({
      where,
      select: publicSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  count(where: Prisma.SalonWhereInput) {
    return prisma.salon.count({ where });
  },

  findInBoundingBox(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    status?: SalonStatus,
    search?: string,
  ) {
    return prisma.salon.findMany({
      where: {
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
        ...(status ? { status } : {}),
        ...(search ? searchWhere(search) : {}),
      },
      select: publicSelect,
    });
  },

  update(id: string, data: Prisma.SalonUpdateInput) {
    return prisma.salon.update({ where: { id }, data, select: publicSelect });
  },

  delete(id: string) {
    return prisma.salon.delete({ where: { id } });
  },

  hasBookings(id: string) {
    return prisma.booking.count({ where: { salonId: id }, take: 1 }).then((c) => c > 0);
  },
};
