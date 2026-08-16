export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "ONLINE" | "CASH" | "CARD";
export type PaymentType = "DEPOSIT" | "REMAINING" | "FULL";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  providerRef?: string | null;
  signature?: string | null;
  verifiedAt?: string | null;
  refundedAt?: string | null;
  refundReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  booking?: {
    id: string;
    startAt?: string;
    price?: number;
    salon: { id: string; name: string; address?: string };
    client: { id: string; firstName?: string | null; lastName?: string | null; phone: string };
  };
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: string;
}
