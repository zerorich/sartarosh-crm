export type PaymentMethod = "ONLINE" | "CASH" | "CARD";
export type PaymentType = "DEPOSIT" | "REMAINING" | "FULL";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  providerRef: string | null;
  signature: string | null;
  verifiedAt: string | null;
  refundedAt: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/payments/create javobi — sandbox provider "intent". */
export interface PaymentIntent {
  paymentId: string;
  amount: number;
  signature: string;
}

export interface CreatePaymentResult {
  payment: Payment;
  intent?: PaymentIntent;
}
