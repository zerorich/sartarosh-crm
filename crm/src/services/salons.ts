import { apiClient } from "./client";
import type { Paginated } from "@/types/api";
import type { Salon, WorkingHour } from "@/types/salon";

/** GET /api/salons auto-scopes to the authenticated OWNER's own salons. */
export function fetchMySalons() {
  return apiClient.get<Paginated<Salon>>("/salons", { page: 1, limit: 50 });
}

export function fetchSalon(id: string) {
  return apiClient.get<Salon>(`/salons/${id}`);
}

export interface UpdateSalonInput {
  name?: string;
  description?: string | null;
  address?: string;
  city?: string | null;
  lat?: number;
  lng?: number;
  phone?: string | null;
  coverUrl?: string | null;
  depositType?: "PERCENTAGE" | "FIXED" | "NONE";
  depositValue?: number;
  workingHours?: Array<Pick<WorkingHour, "dayOfWeek" | "startTime" | "endTime">>;
}

export function updateSalon(id: string, input: UpdateSalonInput) {
  return apiClient.patch<Salon>(`/salons/${id}`, input);
}
