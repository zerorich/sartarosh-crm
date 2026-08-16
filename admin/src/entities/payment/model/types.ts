export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "ONLINE" | "CASH" | "CARD";
export type PaymentType = "DEPOSIT" | "REMAINING" | "FULL";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number | string;
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  providerRef?: string | null;
  createdAt: string;
  booking?: {
    id: string;
    salon: { id: string; name: string };
    client: { id: string; phone: string };
  };
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: string;
}
