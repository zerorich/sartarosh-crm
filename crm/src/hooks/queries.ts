"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as bookingService from "@/services/bookings";
import * as catalogService from "@/services/catalog";
import * as paymentService from "@/services/payments";
import * as salonService from "@/services/salons";
import * as staffService from "@/services/staff";
import type { ListBookingsQuery } from "@/services/bookings";

export function useBookings(query: ListBookingsQuery = {}) {
  return useQuery({
    queryKey: ["bookings", query],
    queryFn: () => bookingService.fetchBookings(query),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => bookingService.fetchBooking(id!),
    enabled: Boolean(id),
  });
}

function useBookingLifecycleMutation(fn: (id: string) => ReturnType<typeof bookingService.arriveBooking>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useArriveBooking() {
  return useBookingLifecycleMutation(bookingService.arriveBooking);
}
export function useStartBooking() {
  return useBookingLifecycleMutation(bookingService.startBooking);
}
export function useCompleteBooking() {
  return useBookingLifecycleMutation(bookingService.completeBooking);
}
export function useNoShowBooking() {
  return useBookingLifecycleMutation(bookingService.noShowBooking);
}
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingService.cancelBooking(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useRecordCashPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { payment } = await paymentService.createCashPayment(bookingId);
      return paymentService.verifyPayment(payment.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useMySalons() {
  return useQuery({
    queryKey: ["salons", "mine"],
    queryFn: salonService.fetchMySalons,
  });
}

export function useSalon(id: string | undefined) {
  return useQuery({
    queryKey: ["salons", id],
    queryFn: () => salonService.fetchSalon(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: salonService.UpdateSalonInput }) =>
      salonService.updateSalon(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["salons", id] });
      queryClient.invalidateQueries({ queryKey: ["salons", "mine"] });
    },
  });
}

export function useSalonServices(salonId: string | undefined) {
  return useQuery({
    queryKey: ["salons", salonId, "services"],
    queryFn: () => catalogService.fetchSalonServices(salonId!),
    enabled: Boolean(salonId),
  });
}

export function useCreateService(salonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string; durationMinutes: number; price: number }) =>
      catalogService.createService(salonId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salons", salonId, "services"] }),
  });
}

export function useUpdateService(salonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof catalogService.updateService>[1] }) =>
      catalogService.updateService(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salons", salonId, "services"] }),
  });
}

export function useChangeServicePrice(salonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => catalogService.changeServicePrice(id, price),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salons", salonId, "services"] }),
  });
}

export function useSalonStaff(salonId: string | undefined) {
  return useQuery({
    queryKey: ["salons", salonId, "staff"],
    queryFn: () => staffService.fetchSalonStaff(salonId!),
    enabled: Boolean(salonId),
  });
}

export function useInviteStaff(salonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof staffService.inviteStaff>[1]) => staffService.inviteStaff(salonId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salons", salonId, "staff"] }),
  });
}

export function useUpdateStaff(salonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof staffService.updateStaff>[1] }) =>
      staffService.updateStaff(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salons", salonId, "staff"] }),
  });
}
