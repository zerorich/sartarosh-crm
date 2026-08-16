import { z } from "zod";
import { uuidSchema } from "./common";
import { paginationSchema } from "../utils/pagination";

export const createComplaintSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(5000),
  salonId: uuidSchema.optional(),
  bookingId: uuidSchema.optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"]).optional(),
  adminNote: z.string().trim().max(2000).optional(),
});

export const complaintListQuerySchema = paginationSchema.extend({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"]).optional(),
});

export const complaintIdParamSchema = z.object({
  id: uuidSchema,
});
