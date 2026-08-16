export type SalonStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED" | "SUSPENDED";

export interface SalonOwner {
  id: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
}

export interface SalonService {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number | string;
  isActive: boolean;
}

export interface SalonStaffMember {
  id: string;
  status: string;
  barber: {
    id: string;
    rating: number;
    reviewCount: number;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      phone: string;
    };
  };
}

export interface Salon {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city?: string | null;
  lat: number;
  lng: number;
  phone?: string | null;
  coverUrl?: string | null;
  status: SalonStatus;
  rejectReason?: string | null;
  rating: number;
  reviewCount: number;
  depositType: "PERCENTAGE" | "FIXED" | "NONE";
  depositValue: number;
  createdAt: string;
  updatedAt?: string;
  owner?: SalonOwner;
  staffCount?: number;
  bookingsCount?: number;
  services?: SalonService[];
  staff?: SalonStaffMember[];
}

export interface SalonListParams {
  page?: number;
  limit?: number;
  status?: SalonStatus;
}
