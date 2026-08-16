import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Salon, SalonListParams } from "../model/types";

export const SALON_KEYS = {
  all: ["salons"] as const,
  lists: () => [...SALON_KEYS.all, "list"] as const,
  list: (params: SalonListParams) => [...SALON_KEYS.lists(), params] as const,
  details: () => [...SALON_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SALON_KEYS.details(), id] as const,
};

export function useSalonsQuery(params: SalonListParams = { page: 1, limit: 20 }) {
  const { page, limit, status } = params;
  return useQuery<PaginatedResult<Salon>>({
    queryKey: SALON_KEYS.list(params),
    queryFn: () => api.get<PaginatedResult<Salon>>("/admin/salons", { page, limit, status }),
  });
}

export function useSalonDetailQuery(salonId: string) {
  return useQuery<Salon>({
    queryKey: SALON_KEYS.detail(salonId),
    queryFn: () => api.get<Salon>(`/admin/salons/${salonId}`),
    enabled: !!salonId,
  });
}

export function useApproveSalonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salonId: string) => api.patch<Salon>(`/admin/salons/${salonId}/approve`),
    onSuccess: (updatedSalon, salonId) => {
      queryClient.invalidateQueries({ queryKey: SALON_KEYS.lists() });
      queryClient.setQueryData(SALON_KEYS.detail(salonId), updatedSalon);
    },
  });
}

export function useRejectSalonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonId, reason }: { salonId: string; reason: string }) =>
      api.patch<Salon>(`/admin/salons/${salonId}/reject`, { reason }),
    onSuccess: (updatedSalon, { salonId }) => {
      queryClient.invalidateQueries({ queryKey: SALON_KEYS.lists() });
      queryClient.setQueryData(SALON_KEYS.detail(salonId), updatedSalon);
    },
  });
}

export function useBlockSalonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonId, reason }: { salonId: string; reason?: string }) =>
      api.patch<Salon>(`/admin/salons/${salonId}/block`, { reason }),
    onSuccess: (updatedSalon, { salonId }) => {
      queryClient.invalidateQueries({ queryKey: SALON_KEYS.lists() });
      queryClient.setQueryData(SALON_KEYS.detail(salonId), updatedSalon);
    },
  });
}
