export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  code: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/** server/src/types/index.ts ERROR_CODES bilan bir xil bo'lishi shart. */
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

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
