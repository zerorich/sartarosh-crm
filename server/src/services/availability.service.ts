import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { blockedTimeRepository } from "../repositories/blocked-time.repository";
import { workingHourRepository } from "../repositories/working-hour.repository";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";

export interface SlotInput {
  salonId: string;
  barberId: string;
  startAt: Date;
  endAt: Date;
}

type DbClient = Prisma.TransactionClient | typeof prisma;

const ACTIVE_BOOKING_STATUSES = ["PENDING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"] as const;

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function slotWithinHours(
  workingHours: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  startAt: Date,
  endAt: Date,
): boolean {
  if (workingHours.length === 0) return false;

  const dayOfWeek = startAt.getDay();
  const dayHours = workingHours.filter((wh) => wh.dayOfWeek === dayOfWeek);
  if (dayHours.length === 0) return false;

  const startTime = formatTime(startAt);
  const endTime = formatTime(endAt);

  return dayHours.some((wh) => startTime >= wh.startTime && endTime <= wh.endTime);
}

function isBlocked(
  blockedTimes: Array<{ startAt: Date; endAt: Date }>,
  startAt: Date,
  endAt: Date,
): boolean {
  return blockedTimes.some((bt) => startAt < bt.endAt && endAt > bt.startAt);
}

export const availabilityService = {
  getSalonSchedule(salonId: string) {
    return Promise.all([
      workingHourRepository.findBySalon(salonId),
      blockedTimeRepository.findBySalon(salonId),
    ]).then(([workingHours, blockedTimes]) => ({ workingHours, blockedTimes }));
  },

  getBarberSchedule(barberId: string) {
    return Promise.all([
      workingHourRepository.findByBarber(barberId),
      blockedTimeRepository.findByBarber(barberId),
    ]).then(([workingHours, blockedTimes]) => ({ workingHours, blockedTimes }));
  },

  isWithinWorkingHours(
    workingHours: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
    date: Date,
  ): boolean {
    return slotWithinHours(workingHours, date, date);
  },

  isBlocked,
};

export async function assertSlotAvailable(input: SlotInput, tx?: Prisma.TransactionClient) {
  const db: DbClient = tx ?? prisma;

  const [salonHours, barberHours, salonBlocks, barberBlocks, overlapCount] = await Promise.all([
    workingHourRepository.findBySalon(input.salonId),
    workingHourRepository.findByBarber(input.barberId),
    blockedTimeRepository.findBySalon(input.salonId),
    blockedTimeRepository.findByBarber(input.barberId),
    db.booking.count({
      where: {
        barberId: input.barberId,
        status: { in: [...ACTIVE_BOOKING_STATUSES] },
        startAt: { lt: input.endAt },
        endAt: { gt: input.startAt },
      },
    }),
  ]);

  if (salonHours.length > 0 && !slotWithinHours(salonHours, input.startAt, input.endAt)) {
    throw AppError.badRequest("Salon is closed at this time", ERROR_CODES.SALON_CLOSED);
  }

  const barberSchedule = barberHours.length > 0 ? barberHours : salonHours;
  if (!slotWithinHours(barberSchedule, input.startAt, input.endAt)) {
    throw AppError.badRequest("Barber is not working at this time", ERROR_CODES.BARBER_NOT_WORKING);
  }

  if (isBlocked([...salonBlocks, ...barberBlocks], input.startAt, input.endAt)) {
    throw AppError.badRequest("Time slot is blocked", ERROR_CODES.TIME_BLOCKED);
  }

  if (overlapCount > 0) {
    throw AppError.conflict("Booking slot unavailable", ERROR_CODES.BOOKING_SLOT_UNAVAILABLE);
  }
}

export async function lockBarberSlot(input: SlotInput, tx: Prisma.TransactionClient) {
  const lockKey = `${input.barberId}:${input.startAt.toISOString()}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
}

export interface AvailableSlotsInput {
  salonId: string;
  barberId: string;
  serviceId: string;
  date: Date;
}

export interface AvailableSlot {
  startAt: string;
  endAt: string;
}

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"] as const;

function parseHm(value: string): [number, number] {
  const [h, m] = value.split(":");
  return [Number(h ?? 0), Number(m ?? 0)];
}

/**
 * Enumerates bookable slots for a given calendar day, applying the same
 * salon/barber-hours + blocked-time + overlap rules as assertSlotAvailable,
 * so the client never has to reimplement scheduling logic itself.
 */
export async function getAvailableSlots(input: AvailableSlotsInput): Promise<AvailableSlot[]> {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, salonId: input.salonId },
  });
  if (!service) throw AppError.notFound("Service not found");
  if (!service.isActive) {
    throw AppError.badRequest("Service is inactive", ERROR_CODES.SERVICE_INACTIVE);
  }

  const [salonHours, barberHours, salonBlocks, barberBlocks] = await Promise.all([
    workingHourRepository.findBySalon(input.salonId),
    workingHourRepository.findByBarber(input.barberId),
    blockedTimeRepository.findBySalon(input.salonId),
    blockedTimeRepository.findByBarber(input.barberId),
  ]);

  const dayOfWeek = input.date.getDay();
  const salonDay = salonHours.filter((h) => h.dayOfWeek === dayOfWeek);
  if (salonHours.length > 0 && salonDay.length === 0) return [];

  const barberSchedule = barberHours.length > 0 ? barberHours : salonHours;
  const barberDay = barberSchedule.filter((h) => h.dayOfWeek === dayOfWeek);
  if (barberDay.length === 0) return [];

  const dayStart = new Date(input.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const blocked = [...salonBlocks, ...barberBlocks];

  const existingBookings = await prisma.booking.findMany({
    where: {
      barberId: input.barberId,
      status: { in: [...ACTIVE_STATUSES] },
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
    },
    select: { startAt: true, endAt: true },
  });

  const durationMs = service.durationMinutes * 60_000;
  const slots: AvailableSlot[] = [];

  for (const window of barberDay) {
    const windowStart = new Date(dayStart);
    const [startH, startM] = parseHm(window.startTime);
    windowStart.setHours(startH, startM, 0, 0);
    const windowEnd = new Date(dayStart);
    const [endH, endM] = parseHm(window.endTime);
    windowEnd.setHours(endH, endM, 0, 0);

    for (
      let slotStart = new Date(windowStart);
      slotStart.getTime() + durationMs <= windowEnd.getTime();
      slotStart = new Date(slotStart.getTime() + durationMs)
    ) {
      const slotEnd = new Date(slotStart.getTime() + durationMs);
      if (slotStart <= now) continue;
      if (salonHours.length > 0 && !slotWithinHours(salonDay, slotStart, slotEnd)) continue;
      if (isBlocked(blocked, slotStart, slotEnd)) continue;
      if (existingBookings.some((b) => slotStart < b.endAt && slotEnd > b.startAt)) continue;

      slots.push({ startAt: slotStart.toISOString(), endAt: slotEnd.toISOString() });
    }
  }

  return slots;
}
