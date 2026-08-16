import { useQuery } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Barber, BarberListParams } from "../model/types";

export const BARBER_KEYS = {
  all: ["barbers"] as const,
  lists: () => [...BARBER_KEYS.all, "list"] as const,
  list: (params: BarberListParams) => [...BARBER_KEYS.lists(), params] as const,
  details: () => [...BARBER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BARBER_KEYS.details(), id] as const,
};

export function useBarbersQuery(params: BarberListParams = { page: 1, limit: 20 }) {
  const { page, limit, search, salonId } = params;
  return useQuery<PaginatedResult<Barber>>({
    queryKey: BARBER_KEYS.list(params),
    queryFn: () => api.get<PaginatedResult<Barber>>("/admin/barbers", { page, limit, search, salonId }),
  });
}

export function useBarberDetailQuery(barberId: string) {
  return useQuery<Barber>({
    queryKey: BARBER_KEYS.detail(barberId),
    queryFn: () => api.get<Barber>(`/admin/barbers/${barberId}`),
    enabled: !!barberId,
  });
}
