import { z } from "zod";
import { moneySchema, uuidSchema } from "./common";

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  price: moneySchema,
});

export const updateServiceSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
  isActive: z.boolean().optional(),
});

export const changePriceSchema = z.object({
  price: moneySchema.refine((v) => v > 0, "Price must be greater than zero"),
});

export const serviceIdParamSchema = z.object({
  id: uuidSchema,
});

export const salonIdParamSchema = z.object({
  id: uuidSchema,
});
