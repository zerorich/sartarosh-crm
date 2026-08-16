import { apiClient } from "./client";
import type { BarberDetail, SalonStaffMember } from "@/types/barber";

export function fetchSalonBarbers(salonId: string) {
  return apiClient.get<SalonStaffMember[]>(`/salons/${salonId}/staff`);
}

export function fetchBarber(id: string) {
  return apiClient.get<BarberDetail>(`/barbers/${id}`);
}
