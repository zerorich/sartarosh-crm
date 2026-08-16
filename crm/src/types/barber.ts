import type { Service } from "./service";

export interface BarberUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string;
}

export interface Barber {
  id: string;
  bio: string | null;
  rating: number;
  reviewCount: number;
  user: BarberUser;
}

export interface BarberStaffAssignment {
  id: string;
  salon: {
    id: string;
    name: string;
    address: string;
    city: string | null;
    status: string;
    rating: number;
  };
}

/** GET /api/barbers/:id javobi. */
export interface BarberDetail extends Barber {
  createdAt: string;
  staffAssignments: BarberStaffAssignment[];
  services: Service[];
}

export type StaffStatus = "INVITED" | "ACTIVE" | "REJECTED" | "REMOVED";
export type SalaryType = "FIXED" | "PERCENTAGE" | "FIXED_PLUS_PERCENTAGE";

/** GET /api/salons/:id/staff bitta elementi. */
export interface SalonStaffMember {
  id: string;
  salonId: string;
  barberId: string;
  status: StaffStatus;
  salaryType: SalaryType;
  salaryFixed: number | string;
  salaryPercent: number | string;
  invitedAt: string;
  acceptedAt: string | null;
  barber: Barber;
}
