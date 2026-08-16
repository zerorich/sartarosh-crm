import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Booking, BookingListParams } from "@/entities/booking/model/types";

export const bookingsService = {
  getAll: (params: BookingListParams = { page: 1, limit: 20 }) => {
    const { page, limit, status, salonId } = params;
    return api.get<PaginatedResult<Booking>>("/admin/bookings", { page, limit, status, salonId });
  },

  getById: (id: string) => api.get<Booking>(`/admin/bookings/${id}`),
};
