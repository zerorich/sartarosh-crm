import type { Prisma, StaffStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

const staffSelect = {
  id: true,
  salonId: true,
  barberId: true,
  status: true,
  salaryType: true,
  salaryFixed: true,
  salaryPercent: true,
  invitedAt: true,
  acceptedAt: true,
  createdAt: true,
  updatedAt: true,
  barber: {
    select: {
      id: true,
      bio: true,
      rating: true,
      reviewCount: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.SalonStaffSelect;

export const staffRepository = {
  create(data: Prisma.SalonStaffCreateInput) {
    return prisma.salonStaff.create({ data, select: staffSelect });
  },

  findById(id: string) {
    return prisma.salonStaff.findUnique({
      where: { id },
      select: {
        ...staffSelect,
        salon: { select: { id: true, name: true, ownerId: true, status: true } },
      },
    });
  },

  findBySalonAndBarber(salonId: string, barberId: string) {
    return prisma.salonStaff.findUnique({
      where: { salonId_barberId: { salonId, barberId } },
      select: staffSelect,
    });
  },

  findBySalon(salonId: string, status?: StaffStatus | StaffStatus[]) {
    const statuses = status ? (Array.isArray(status) ? status : [status]) : undefined;
    return prisma.salonStaff.findMany({
      where: {
        salonId,
        ...(statuses ? { status: { in: statuses } } : {}),
      },
      select: staffSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  update(id: string, data: Prisma.SalonStaffUpdateInput) {
    return prisma.salonStaff.update({ where: { id }, data, select: staffSelect });
  },

  delete(id: string) {
    return prisma.salonStaff.delete({ where: { id } });
  },

  findBarberProfile(barberId: string) {
    return prisma.barberProfile.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        bio: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          },
        },
        staffAssignments: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            salon: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                status: true,
                rating: true,
              },
            },
          },
        },
        barberServices: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
                price: true,
                isActive: true,
                salonId: true,
              },
            },
          },
        },
        workingHours: { orderBy: { dayOfWeek: "asc" } },
        blockedTimes: {
          where: { endAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
        },
      },
    });
  },

  isBarberInSalon(barberProfileId: string, salonId: string) {
    return prisma.salonStaff
      .count({
        where: { barberId: barberProfileId, salonId, status: "ACTIVE" },
        take: 1,
      })
      .then((c) => c > 0);
  },

  /** Default: every active salon service is attached so the barber can be booked. */
  async assignActiveSalonServices(barberId: string, salonId: string) {
    const services = await prisma.service.findMany({
      where: { salonId, isActive: true },
      select: { id: true },
    });
    if (services.length === 0) return { count: 0 };
    return prisma.barberService.createMany({
      data: services.map((service) => ({ barberId, serviceId: service.id })),
      skipDuplicates: true,
    });
  },
};
