export type SalonStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
export type DepositType = "PERCENTAGE" | "FIXED" | "NONE";

export interface WorkingHour {
  id: string;
  salonId: string | null;
  barberId: string | null;
  dayOfWeek: number; // 0=Sunday .. 6=Saturday
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface BlockedTime {
  id: string;
  salonId: string | null;
  barberId: string | null;
  startAt: string;
  endAt: string;
  reason: string | null;
}

export interface Salon {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string | null;
  lat: number;
  lng: number;
  phone: string | null;
  coverUrl: string | null;
  status: SalonStatus;
  rating: number;
  reviewCount: number;
  depositType: DepositType;
  depositValue: number;
  createdAt: string;
  updatedAt: string;
  workingHours?: WorkingHour[];
  blockedTimes?: BlockedTime[];
}

/** GET /api/salons/nearby javobida qo'shiladigan maydon. */
export interface NearbySalon extends Salon {
  distanceKm: number;
}
