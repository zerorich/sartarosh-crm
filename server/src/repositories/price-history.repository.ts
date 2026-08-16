import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const priceHistoryRepository = {
  createInitial(serviceId: string, price: Prisma.Decimal) {
    return prisma.servicePriceHistory.create({
      data: {
        serviceId,
        price,
        effectiveFrom: new Date(),
      },
    });
  },

  findOpenRecord(serviceId: string) {
    return prisma.servicePriceHistory.findFirst({
      where: { serviceId, effectiveTo: null },
      orderBy: { effectiveFrom: "desc" },
    });
  },

  closeRecord(id: string, effectiveTo: Date) {
    return prisma.servicePriceHistory.update({
      where: { id },
      data: { effectiveTo },
    });
  },

  create(data: Prisma.ServicePriceHistoryCreateInput) {
    return prisma.servicePriceHistory.create({ data });
  },

  findByService(serviceId: string) {
    return prisma.servicePriceHistory.findMany({
      where: { serviceId },
      orderBy: { effectiveFrom: "desc" },
    });
  },
};
