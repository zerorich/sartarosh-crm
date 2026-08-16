import { Role } from "@prisma/client";
import { z } from "zod";
import { emailSchema } from "./common";

const signupRoleSchema = z.enum([Role.CLIENT, Role.BARBER, Role.OWNER]);

export const sendOtpSchema = z.object({
  email: emailSchema,
  role: signupRoleSchema.optional().default(Role.CLIENT),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits"),
  role: signupRoleSchema.optional().default(Role.CLIENT),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1).optional(),
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().min(1).optional(),
});
