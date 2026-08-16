import { z } from "zod";
import { uuidSchema } from "./common";

export const savedSalonParamSchema = z.object({
  salonId: uuidSchema,
});

export const updateMeSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  avatarUrl: z.string().trim().url().max(500).nullable().optional(),
});
