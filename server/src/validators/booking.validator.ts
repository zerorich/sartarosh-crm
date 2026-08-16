import { z } from "zod";
import { BookingStatus } from "@prisma/client";
import { dateSchema, uuidSchema } from "./common";

export const quoteBookingQuerySchema = z.object({
  salonId: uuidSchema,
  serviceId: uuidSchema,
  couponId: uuidSchema.optional(),
});

export const createBookingSchema = z.object({
  salonId: uuidSchema,
  barberId: uuidSchema,
  serviceId: uuidSchema,
  startAt: dateSchema,
  couponId: uuidSchema.optional(),
});

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(BookingStatus).optional(),
  salonId: uuidSchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
