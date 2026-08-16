import { apiClient } from "./client";
import type { Service } from "@/types/service";

export function fetchSalonServices(salonId: string) {
  return apiClient.get<Service[]>(`/salons/${salonId}/services`);
}

export function createService(salonId: string, input: { name: string; description?: string; durationMinutes: number; price: number }) {
  return apiClient.post<Service>(`/salons/${salonId}/services`, input);
}

export function updateService(serviceId: string, input: { name?: string; description?: string | null; durationMinutes?: number; isActive?: boolean }) {
  return apiClient.patch<Service>(`/services/${serviceId}`, input);
}

/**
 * The dedicated price-change endpoint — writes ServicePriceHistory and keeps
 * already-created bookings' price snapshots intact. Never use the plain
 * updateService PATCH to change price.
 */
export function changeServicePrice(serviceId: string, price: number) {
  return apiClient.post<Service>(`/services/${serviceId}/price`, { price });
}

export interface PriceHistoryEntry {
  id: string;
  price: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}

export function fetchPriceHistory(serviceId: string) {
  return apiClient.get<PriceHistoryEntry[]>(`/services/${serviceId}/price-history`);
}
