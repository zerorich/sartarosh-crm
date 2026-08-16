import { z } from "zod";
import { phoneSchema, uuidSchema } from "./common";

export const salonIdParamSchema = z.object({
  id: uuidSchema,
});

export const inviteStaffSchema = z.object({
  barberPhone: phoneSchema,
  salaryType: z.enum(["FIXED", "PERCENTAGE", "FIXED_PLUS_PERCENTAGE"]).optional(),
  salaryFixed: z.coerce.number().nonnegative().optional(),
  salaryPercent: z.coerce.number().min(0).max(100).optional(),
});

export const updateStaffSchema = z.object({
  status: z.enum(["INVITED", "ACTIVE", "REJECTED", "REMOVED"]).optional(),
  salaryType: z.enum(["FIXED", "PERCENTAGE", "FIXED_PLUS_PERCENTAGE"]).optional(),
  salaryFixed: z.coerce.number().nonnegative().optional(),
  salaryPercent: z.coerce.number().min(0).max(100).optional(),
});

export const staffIdParamSchema = z.object({
  id: uuidSchema,
});

export const barberIdParamSchema = z.object({
  id: uuidSchema,
});
