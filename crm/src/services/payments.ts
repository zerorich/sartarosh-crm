import { apiClient } from "./client";
import type { CreatePaymentResult, Payment } from "@/types/payment";

/** Staff records cash received for a booking (method CASH, full price in one go). */
export function createCashPayment(bookingId: string) {
  return apiClient.post<CreatePaymentResult>("/payments/create", {
    bookingId,
    method: "CASH",
    type: "FULL",
  });
}

/** CASH payments need no signature — verifyPayment just requires a non-client actor. */
export function verifyPayment(paymentId: string) {
  return apiClient.post<Payment>(`/payments/${paymentId}/verify`, {});
}
