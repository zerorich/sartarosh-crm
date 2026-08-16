import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Payment, PaymentListParams } from "../model/types";

export const PAYMENT_KEYS = {
  all: ["payments"] as const,
  lists: () => [...PAYMENT_KEYS.all, "list"] as const,
  list: (params: PaymentListParams) => [...PAYMENT_KEYS.lists(), params] as const,
  details: () => [...PAYMENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PAYMENT_KEYS.details(), id] as const,
};

export function usePaymentsQuery(params: PaymentListParams = { page: 1, limit: 20 }) {
  return useQuery<PaginatedResult<Payment>>({
    queryKey: PAYMENT_KEYS.list(params),
    queryFn: () => api.get<PaginatedResult<Payment>>("/admin/payments", params as any),
  });
}

export function usePaymentQuery(id: string) {
  return useQuery<Payment>({
    queryKey: PAYMENT_KEYS.detail(id),
    queryFn: () => api.get<Payment>(`/admin/payments/${id}`),
    enabled: !!id,
  });
}

export function useRefundPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
      api.patch<Payment>(`/admin/payments/${paymentId}/refund`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
    },
  });
}
