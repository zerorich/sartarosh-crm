import { useQuery } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Booking, BookingListParams } from "../model/types";

export const BOOKING_KEYS = {
  all: ["bookings"] as const,
  lists: () => [...BOOKING_KEYS.all, "list"] as const,
  list: (params: BookingListParams) => [...BOOKING_KEYS.lists(), params] as const,
  details: () => [...BOOKING_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BOOKING_KEYS.details(), id] as const,
};

export function useBookingsQuery(params: BookingListParams = { page: 1, limit: 20 }) {
  const { page, limit, status, salonId } = params;
  return useQuery<PaginatedResult<Booking>>({
    queryKey: BOOKING_KEYS.list(params),
    queryFn: () =>
      api.get<PaginatedResult<Booking>>("/admin/bookings", { page, limit, status, salonId }),
  });
}

export function useBookingQuery(id: string) {
  return useQuery<Booking>({
    queryKey: BOOKING_KEYS.detail(id),
    queryFn: () => api.get<Booking>(`/admin/bookings/${id}`),
    enabled: !!id,
  });
}
