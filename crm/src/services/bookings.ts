import { apiClient } from "./client";
import type { Paginated } from "@/types/api";
import type { Booking, BookingStatus } from "@/types/booking";

export interface ListBookingsQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  salonId?: string;
  from?: string;
  to?: string;
}

/**
 * Server-side scoped already: BARBER sees only their own bookings, OWNER
 * sees their salon's bookings — no client-side filtering needed.
 */
export function fetchBookings(query: ListBookingsQuery = {}) {
  return apiClient.get<Paginated<Booking>>("/bookings", query);
}

export function fetchBooking(id: string) {
  return apiClient.get<Booking>(`/bookings/${id}`);
}

export function arriveBooking(id: string) {
  return apiClient.post<Booking>(`/bookings/${id}/arrive`);
}

export function startBooking(id: string) {
  return apiClient.post<Booking>(`/bookings/${id}/start`);
}

export function completeBooking(id: string) {
  return apiClient.post<Booking>(`/bookings/${id}/complete`);
}

export function noShowBooking(id: string) {
  return apiClient.post<Booking>(`/bookings/${id}/no-show`);
}

export function cancelBooking(id: string, reason?: string) {
  return apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason });
}
