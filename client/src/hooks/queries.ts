"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as availabilityService from "@/services/availability";
import * as barberService from "@/services/barbers";
import * as bookingService from "@/services/bookings";
import * as paymentService from "@/services/payments";
import * as reviewService from "@/services/reviews";
import * as salonService from "@/services/salons";
import * as serviceService from "@/services/services";
import * as userService from "@/services/users";
import type { CreateBookingInput } from "@/services/bookings";
import type { CreateReviewInput } from "@/types/review";

export function useNearbySalons(lat: number | null, lng: number | null, radiusKm: number, search?: string) {
  return useQuery({
    queryKey: ["salons", "nearby", lat, lng, radiusKm, search ?? ""],
    queryFn: () => salonService.fetchNearbySalons({ lat: lat!, lng: lng!, radius: radiusKm, search }),
    enabled: lat !== null && lng !== null,
  });
}

export function useSalon(salonId: string | undefined) {
  return useQuery({
    queryKey: ["salons", salonId],
    queryFn: () => salonService.fetchSalon(salonId!),
    enabled: Boolean(salonId),
  });
}

export function useSalonServices(salonId: string | undefined) {
  return useQuery({
    queryKey: ["salons", salonId, "services"],
    queryFn: () => serviceService.fetchSalonServices(salonId!),
    enabled: Boolean(salonId),
  });
}

export function useSalonBarbers(salonId: string | undefined) {
  return useQuery({
    queryKey: ["salons", salonId, "staff"],
    queryFn: () => barberService.fetchSalonBarbers(salonId!),
    enabled: Boolean(salonId),
  });
}

export function useBarber(barberId: string | undefined) {
  return useQuery({
    queryKey: ["barbers", barberId],
    queryFn: () => barberService.fetchBarber(barberId!),
    enabled: Boolean(barberId),
  });
}

export function useSalonReviews(salonId: string | undefined) {
  return useQuery({
    queryKey: ["salons", salonId, "reviews"],
    queryFn: () => reviewService.fetchSalonReviews(salonId!),
    enabled: Boolean(salonId),
  });
}

export function useBarberReviews(barberId: string | undefined) {
  return useQuery({
    queryKey: ["barbers", barberId, "reviews"],
    queryFn: () => reviewService.fetchBarberReviews(barberId!),
    enabled: Boolean(barberId),
  });
}

export function useAvailability(params: {
  salonId: string | undefined;
  barberId: string | undefined;
  serviceId: string | undefined;
  date: string | undefined;
}) {
  const { salonId, barberId, serviceId, date } = params;
  return useQuery({
    queryKey: ["availability", salonId, barberId, serviceId, date],
    queryFn: () => availabilityService.fetchAvailability({ salonId: salonId!, barberId: barberId!, serviceId: serviceId!, date: date! }),
    enabled: Boolean(salonId && barberId && serviceId && date),
  });
}

export function useBookingQuote(params: { salonId: string | undefined; serviceId: string | undefined; couponId?: string | null }) {
  const { salonId, serviceId, couponId } = params;
  return useQuery({
    queryKey: ["bookings", "quote", salonId, serviceId, couponId ?? null],
    queryFn: () => bookingService.fetchBookingQuote({ salonId: salonId!, serviceId: serviceId!, couponId: couponId ?? undefined }),
    enabled: Boolean(salonId && serviceId),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingService.createBooking(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useBookings(status?: string) {
  return useQuery({
    queryKey: ["bookings", status ?? "all"],
    queryFn: () => bookingService.fetchBookings(status ? { status: status as never } : {}),
  });
}

export function useBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["bookings", bookingId],
    queryFn: () => bookingService.fetchBooking(bookingId!),
    enabled: Boolean(bookingId),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingService.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: paymentService.createPayment,
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, signature }: { paymentId: string; signature: string }) =>
      paymentService.verifyPayment(paymentId, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.createReview(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useMyCoupons() {
  return useQuery({
    queryKey: ["me", "coupons"],
    queryFn: userService.fetchMyCoupons,
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ["me", "reviews"],
    queryFn: userService.fetchMyReviews,
  });
}

export function useSavedSalons() {
  return useQuery({
    queryKey: ["me", "saved-salons"],
    queryFn: userService.fetchSavedSalons,
  });
}

export function useToggleSavedSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ salonId, saved }: { salonId: string; saved: boolean }) =>
      saved ? userService.unsaveSalon(salonId) : userService.saveSalon(salonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "saved-salons"] });
    },
  });
}
