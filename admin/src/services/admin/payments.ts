import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Payment, PaymentListParams } from "@/entities/payment/model/types";

export const paymentsService = {
  getAll: (params: PaymentListParams = { page: 1, limit: 20 }) =>
    api.get<PaginatedResult<Payment>>("/admin/payments", params as any),

  getById: (id: string) =>
    api.get<Payment>(`/admin/payments/${id}`),

  refund: (id: string, reason?: string) =>
    api.patch<Payment>(`/admin/payments/${id}/refund`, { reason }),
};
