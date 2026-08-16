import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const workingHourRepository = {
  findBySalon(salonId: string) {
    return prisma.workingHour.findMany({
      where: { salonId },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  findByBarber(barberId: string) {
    return prisma.workingHour.findMany({
      where: { barberId },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  replaceForSalon(salonId: string, hours: Omit<Prisma.WorkingHourCreateManyInput, "salonId">[]) {
    return prisma.$transaction([
      prisma.workingHour.deleteMany({ where: { salonId } }),
      prisma.workingHour.createMany({
        data: hours.map((h) => ({ ...h, salonId })),
      }),
    ]);
  },

  replaceForBarber(barberId: string, hours: Omit<Prisma.WorkingHourCreateManyInput, "barberId">[]) {
    return prisma.$transaction([
      prisma.workingHour.deleteMany({ where: { barberId } }),
      prisma.workingHour.createMany({
        data: hours.map((h) => ({ ...h, barberId })),
      }),
    ]);
  },
};
