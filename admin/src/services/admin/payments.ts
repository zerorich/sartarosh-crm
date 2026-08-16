import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Payment, PaymentListParams } from "@/entities/payment/model/types";

export const paymentsService = {
  getAll: (params: PaymentListParams = { page: 1, limit: 20 }) => {
    const { page, limit, status } = params;
    return api.get<PaginatedResult<Payment>>("/admin/payments", { page, limit, status });
  },

  refund: (id: string, reason?: string) =>
    api.patch<Payment>(`/admin/payments/${id}/refund`, { reason }),
};
