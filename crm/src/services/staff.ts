import { apiClient } from "./client";
import type { BarberDetail, SalaryType, SalonStaffMember, StaffStatus } from "@/types/barber";

export function fetchSalonStaff(salonId: string) {
  return apiClient.get<SalonStaffMember[]>(`/salons/${salonId}/staff`);
}

export function inviteStaff(salonId: string, input: { barberPhone: string; salaryType?: SalaryType; salaryFixed?: number; salaryPercent?: number }) {
  return apiClient.post<SalonStaffMember>(`/salons/${salonId}/staff`, input);
}

export function updateStaff(staffId: string, input: { status?: StaffStatus; salaryType?: SalaryType; salaryFixed?: number; salaryPercent?: number }) {
  return apiClient.patch<SalonStaffMember>(`/staff/${staffId}`, input);
}

export function removeStaff(staffId: string) {
  return apiClient.delete<SalonStaffMember>(`/staff/${staffId}`);
}

export function fetchBarber(id: string) {
  return apiClient.get<BarberDetail>(`/barbers/${id}`);
}
