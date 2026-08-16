import { z } from "zod";
import { PaymentMethod, PaymentType } from "@prisma/client";
import { uuidSchema } from "./common";

export const createPaymentSchema = z.object({
  bookingId: uuidSchema,
  method: z.nativeEnum(PaymentMethod),
  type: z.nativeEnum(PaymentType),
});

export const verifyPaymentSchema = z.object({
  signature: z.string().min(1).optional(),
});

export const refundPaymentSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
