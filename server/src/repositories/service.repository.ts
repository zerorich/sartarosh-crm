import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const serviceSelect = {
  id: true,
  salonId: true,
  name: true,
  description: true,
  durationMinutes: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceSelect;

export const serviceRepository = {
  create(data: Prisma.ServiceCreateInput) {
    return prisma.service.create({ data, select: serviceSelect });
  },

  findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      select: {
        ...serviceSelect,
        salon: { select: { id: true, ownerId: true, status: true } },
      },
    });
  },

  findBySalon(salonId: string, activeOnly = false) {
    return prisma.service.findMany({
      where: {
        salonId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      select: serviceSelect,
      orderBy: { name: "asc" },
    });
  },

  update(id: string, data: Prisma.ServiceUpdateInput) {
    return prisma.service.update({ where: { id }, data, select: serviceSelect });
  },

  deactivate(id: string) {
    return prisma.service.update({
      where: { id },
      data: { isActive: false },
      select: serviceSelect,
    });
  },
};
