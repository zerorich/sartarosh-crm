export type SalonStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED" | "SUSPENDED";

export interface SalonOwner {
  id: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
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
  depositValue: number | string;
  createdAt: string;
  updatedAt?: string;
  owner?: SalonOwner;
  /** Only present on the salon detail endpoint (`GET /admin/salons/:id`), not on list responses. */
  _count?: { staff: number; bookings: number; reviews: number; services: number };
}

export interface SalonListParams {
  page?: number;
  limit?: number;
  status?: SalonStatus;
}
