export type BarberStatus = "ACTIVE" | "BLOCKED";

export interface BarberStaffAssignment {
  id: string;
  status: string;
  salon: {
    id: string;
    name: string;
  };
}

export interface Barber {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
    isBlocked: boolean;
  };
  staffAssignments?: BarberStaffAssignment[];
  bio?: string | null;
  rating: number;
  reviewCount: number;
  _count?: { bookings: number; reviews: number };
  createdAt: string;
}

export interface BarberListParams {
  page?: number;
  limit?: number;
  search?: string;
  salonId?: string;
}
