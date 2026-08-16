import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const blockedTimeRepository = {
  findBySalon(salonId: string, from = new Date()) {
    return prisma.blockedTime.findMany({
      where: { salonId, endAt: { gte: from } },
      orderBy: { startAt: "asc" },
    });
  },

  findByBarber(barberId: string, from = new Date()) {
    return prisma.blockedTime.findMany({
      where: { barberId, endAt: { gte: from } },
      orderBy: { startAt: "asc" },
    });
  },

  create(data: Prisma.BlockedTimeCreateInput) {
    return prisma.blockedTime.create({ data });
  },

  delete(id: string) {
    return prisma.blockedTime.delete({ where: { id } });
  },

  findById(id: string) {
    return prisma.blockedTime.findUnique({ where: { id } });
  },
};
