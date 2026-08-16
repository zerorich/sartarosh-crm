import { apiClient } from "./client";
import type { Paginated } from "@/types/api";
import type { Booking, BookingStatus } from "@/types/booking";

export interface CreateBookingInput {
  salonId: string;
  barberId: string;
  serviceId: string;
  /** ISO datetime */
  startAt: string;
  couponId?: string;
}

export function createBooking(input: CreateBookingInput) {
  return apiClient.post<Booking>("/bookings", input);
}

export interface BookingQuote {
  price: number;
  depositAmount: number;
  remainingAmount: number;
  couponApplied: boolean;
}

export function fetchBookingQuote(query: { salonId: string; serviceId: string; couponId?: string }) {
  return apiClient.get<BookingQuote>("/bookings/quote", query);
}

export interface ListBookingsQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export function fetchBookings(query: ListBookingsQuery = {}) {
  return apiClient.get<Paginated<Booking>>("/bookings", query);
}

export function fetchBooking(id: string) {
  return apiClient.get<Booking>(`/bookings/${id}`);
}

export function cancelBooking(id: string, reason?: string) {
  return apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason });
}
