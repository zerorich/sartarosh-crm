import { apiClient } from "./client";
import type { CreatePaymentResult, Payment, PaymentMethod, PaymentType } from "@/types/payment";

export function createPayment(input: { bookingId: string; method: PaymentMethod; type: PaymentType }) {
  return apiClient.post<CreatePaymentResult>("/payments/create", input);
}

export function verifyPayment(paymentId: string, signature: string) {
  return apiClient.post<Payment>(`/payments/${paymentId}/verify`, { signature });
}

export function fetchPayment(id: string) {
  return apiClient.get<Payment>(`/payments/${id}`);
}
