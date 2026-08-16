import { apiClient } from "./client";
import type { Service } from "@/types/service";

export function fetchSalonServices(salonId: string) {
  return apiClient.get<Service[]>(`/salons/${salonId}/services`);
}
