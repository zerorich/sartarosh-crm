import { useQuery } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Payment, PaymentListParams } from "../model/types";

export const PAYMENT_KEYS = {
  all: ["payments"] as const,
  lists: () => [...PAYMENT_KEYS.all, "list"] as const,
  list: (params: PaymentListParams) => [...PAYMENT_KEYS.lists(), params] as const,
};

export function usePaymentsQuery(params: PaymentListParams = { page: 1, limit: 20 }) {
  return useQuery<PaginatedResult<Payment>>({
    queryKey: PAYMENT_KEYS.list(params),
    queryFn: () => api.get<PaginatedResult<Payment>>("/admin/payments", params as any),
  });
}
