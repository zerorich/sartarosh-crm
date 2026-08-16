import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Booking, BookingListParams } from "@/entities/booking/model/types";

export const bookingsService = {
  getAll: (params: BookingListParams = { page: 1, limit: 20 }) =>
    api.get<PaginatedResult<Booking>>("/admin/bookings", params as any),

  getById: (id: string) =>
    api.get<Booking>(`/admin/bookings/${id}`),
};
