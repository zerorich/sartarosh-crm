import type { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  phone: string;
  role: Role;
  isBlocked: boolean;
}

export interface AuthRequestUser extends AuthUser {
  barberProfileId?: string;
  ownerProfileId?: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
}

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  USER_BLOCKED: "USER_BLOCKED",
  USER_RESTRICTED: "USER_RESTRICTED",
  OTP_INVALID: "OTP_INVALID",
  OTP_EXPIRED: "OTP_EXPIRED",
  SALON_NOT_ACTIVE: "SALON_NOT_ACTIVE",
  SALON_CLOSED: "SALON_CLOSED",
  BARBER_NOT_WORKING: "BARBER_NOT_WORKING",
  BARBER_NOT_IN_SALON: "BARBER_NOT_IN_SALON",
  SERVICE_INACTIVE: "SERVICE_INACTIVE",
  SERVICE_NOT_OFFERED: "SERVICE_NOT_OFFERED",
  TIME_BLOCKED: "TIME_BLOCKED",
  BOOKING_SLOT_UNAVAILABLE: "BOOKING_SLOT_UNAVAILABLE",
  BOOKING_INVALID_STATUS: "BOOKING_INVALID_STATUS",
  PAYMENT_UNVERIFIED: "PAYMENT_UNVERIFIED",
  PAYMENT_INVALID: "PAYMENT_INVALID",
  COUPON_INVALID: "COUPON_INVALID",
  COUPON_EXPIRED: "COUPON_EXPIRED",
  REVIEW_NOT_ALLOWED: "REVIEW_NOT_ALLOWED",
  REVIEW_EXISTS: "REVIEW_EXISTS",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
