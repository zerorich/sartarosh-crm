import { z } from "zod";
import { latSchema, lngSchema, moneySchema } from "./common";

const workingHourSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format (HH:mm)"),
});

export const createSalonSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().max(100).optional(),
  lat: latSchema,
  lng: lngSchema,
  phone: z.string().trim().max(20).optional(),
  coverUrl: z.string().url().max(500).optional(),
  depositType: z.enum(["PERCENTAGE", "FIXED", "NONE"]).optional(),
  depositValue: moneySchema.optional(),
  workingHours: z.array(workingHourSchema).max(7).optional(),
});

export const updateSalonSchema = createSalonSchema.partial();

export const nearbySalonsSchema = z.object({
  lat: latSchema,
  lng: lngSchema,
  radius: z.coerce.number().positive().max(100).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const listSalonsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(120).optional(),
});

export { workingHourSchema };
