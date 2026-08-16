import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../config/prisma";
import { priceHistoryRepository } from "../repositories/price-history.repository";
import { salonRepository } from "../repositories/salon.repository";
import { serviceRepository } from "../repositories/service.repository";
import { staffRepository } from "../repositories/staff.repository";
import { writeAudit } from "./audit.service";
import { assertSalonAccessible } from "./salon.service";
import { AppError } from "../utils/app-error";
import { ERROR_CODES } from "../types";

export interface CreateServiceInput {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  isActive?: boolean;
}

export async function createService(salonId: string, input: CreateServiceInput) {
  await assertSalonAccessible(salonId, false);

  const service = await serviceRepository.create({
    salon: { connect: { id: salonId } },
    name: input.name,
    description: input.description,
    durationMinutes: input.durationMinutes,
    price: new Decimal(input.price),
  });

  await priceHistoryRepository.createInitial(service.id, new Decimal(input.price));

  return service;
}

export async function listSalonServices(
  salonId: string,
  user?: { role: string; ownerProfileId?: string },
) {
  const salonRecord = await salonRepository.findById(salonId);
  if (!salonRecord) throw AppError.notFound("Salon not found");

  const isOwner = user?.ownerProfileId === salonRecord.ownerId;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (salonRecord.status !== "ACTIVE" && !isOwner && !isAdmin) {
    throw AppError.notFound("Salon not found", ERROR_CODES.SALON_NOT_ACTIVE);
  }

  return serviceRepository.findBySalon(salonId, !(isOwner || isAdmin));
}

export async function getServiceById(id: string) {
  const service = await serviceRepository.findById(id);
  if (!service) throw AppError.notFound("Service not found");
  return service;
}

export async function updateService(id: string, input: UpdateServiceInput) {
  const existing = await serviceRepository.findById(id);
  if (!existing) throw AppError.notFound("Service not found");

  return serviceRepository.update(id, input);
}

export async function deleteService(id: string) {
  const existing = await serviceRepository.findById(id);
  if (!existing) throw AppError.notFound("Service not found");

  return serviceRepository.deactivate(id);
}

export async function changeServicePrice(serviceId: string, newPrice: number, actorId: string) {
  const service = await serviceRepository.findById(serviceId);
  if (!service) throw AppError.notFound("Service not found");

  const currentPrice = Number(service.price);
  if (currentPrice === newPrice) {
    throw AppError.badRequest("New price is the same as current price");
  }

  const now = new Date();
  const openRecord = await priceHistoryRepository.findOpenRecord(serviceId);

  await prisma.$transaction(async (tx) => {
    if (openRecord) {
      await tx.servicePriceHistory.update({
        where: { id: openRecord.id },
        data: { effectiveTo: now },
      });
    }

    await tx.servicePriceHistory.create({
      data: {
        serviceId,
        price: new Decimal(newPrice),
        effectiveFrom: now,
      },
    });

    await tx.service.update({
      where: { id: serviceId },
      data: { price: new Decimal(newPrice) },
    });
  });

  await writeAudit({
    actorId,
    action: "PRICE_CHANGED",
    entityType: "Service",
    entityId: serviceId,
    metadata: {
      salonId: service.salonId,
      previousPrice: currentPrice,
      newPrice,
      changedAt: now.toISOString(),
    },
  });

  return serviceRepository.findById(serviceId);
}

export async function getPriceHistory(
  serviceId: string,
  user?: { role: string; barberProfileId?: string; ownerProfileId?: string },
) {
  const service = await serviceRepository.findById(serviceId);
  if (!service) throw AppError.notFound("Service not found");

  if (user?.role === "BARBER" && user.barberProfileId) {
    const assigned = await staffRepository.isBarberInSalon(user.barberProfileId, service.salonId);
    if (!assigned) throw AppError.forbidden("You are not assigned to this salon");
  } else if (user?.role === "OWNER" && user.ownerProfileId) {
    if (user.ownerProfileId !== service.salon.ownerId) {
      throw AppError.forbidden("You do not own this service");
    }
  }

  const history = await priceHistoryRepository.findByService(serviceId);
  return history.map((h) => ({
    id: h.id,
    price: Number(h.price),
    effectiveFrom: h.effectiveFrom,
    effectiveTo: h.effectiveTo,
    createdAt: h.createdAt,
  }));
}
