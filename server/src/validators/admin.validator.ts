import { z } from "zod";
import { uuidSchema } from "./common";
import { paginationSchema } from "../utils/pagination";

const roleSchema = z.enum(["CLIENT", "BARBER", "OWNER", "ADMIN", "SUPER_ADMIN"]);
const salonStatusSchema = z.enum(["PENDING", "ACTIVE", "REJECTED", "BLOCKED"]);

export const adminUserListQuerySchema = paginationSchema.extend({
  role: roleSchema.optional(),
  search: z.string().trim().optional(),
});

export const adminSalonListQuerySchema = paginationSchema.extend({
  status: salonStatusSchema.optional(),
});

export const adminBookingListQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  salonId: uuidSchema.optional(),
});

export const adminPaymentListQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
});

export const adminReviewListQuerySchema = paginationSchema.extend({
  includeHidden: z.coerce.boolean().optional(),
});

export const blockUserSchema = z.object({
  block: z.boolean(),
  reason: z.string().trim().max(500).optional(),
});

export const rejectSalonSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export const blockSalonSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const adminSettingsPatchSchema = z.object({
  noShowLimit: z.coerce.number().int().min(1).max(20).optional(),
  noShowRestrictionDays: z.coerce.number().int().min(1).max(365).optional(),
  barberDelayThreshold: z.coerce.number().int().min(1).max(120).optional(),
  barberDelayCompensationPercent: z.coerce.number().min(0).max(100).optional(),
  couponExpirationDays: z.coerce.number().int().min(1).max(365).optional(),
  reviewEditWindow: z.coerce.number().int().min(1).max(720).optional(),
  defaultSearchRadius: z.coerce.number().int().min(1).max(100).optional(),
  reminder24hEnabled: z.coerce.boolean().optional(),
  reminder30mEnabled: z.coerce.boolean().optional(),
});

export const adminIdParamSchema = z.object({
  id: uuidSchema,
});
