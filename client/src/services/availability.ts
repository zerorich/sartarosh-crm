import { apiClient } from "./client";
import type { AvailabilityResponse } from "@/types/booking";

export interface AvailabilityQuery {
  salonId: string;
  barberId: string;
  serviceId: string;
  /** "YYYY-MM-DD" */
  date: string;
}

export function fetchAvailability(query: AvailabilityQuery) {
  return apiClient.get<AvailabilityResponse>("/availability", query);
}
