import { z } from "zod";
import { ratingSchema, uuidSchema } from "./common";
import { paginationSchema } from "../utils/pagination";

export const createReviewSchema = z.object({
  bookingId: uuidSchema,
  barberRating: ratingSchema,
  salonRating: ratingSchema,
  serviceRating: ratingSchema,
  comment: z.string().trim().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  barberRating: ratingSchema.optional(),
  salonRating: ratingSchema.optional(),
  serviceRating: ratingSchema.optional(),
  comment: z.string().trim().max(2000).nullable().optional(),
});

export const reviewListQuerySchema = paginationSchema;

export const reviewIdParamSchema = z.object({
  id: uuidSchema,
});

export const salonIdParamSchema = z.object({
  id: uuidSchema,
});

export const barberIdParamSchema = z.object({
  id: uuidSchema,
});
