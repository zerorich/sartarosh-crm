export type BarberStatus = "ACTIVE" | "BLOCKED" | "SUSPENDED";

export interface Barber {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
    avatarUrl: string | null;
    isBlocked: boolean;
  };
  salon?: {
    id: string;
    name: string;
  };
  bio?: string | null;
  rating: number;
  reviewCount: number;
  bookingsCount?: number;
  revenue?: number;
  status: BarberStatus;
  createdAt: string;
}

export interface BarberListParams {
  page?: number;
  limit?: number;
  status?: BarberStatus;
  salonId?: string;
}
