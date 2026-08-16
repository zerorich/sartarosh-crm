export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Booking {
  id: string;
  clientId: string;
  salonId: string;
  barberId: string;
  serviceId: string;
  status: BookingStatus;
  startAt: string;
  endAt: string;
  scheduledStartAt: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
  delayMinutes: number;
  price: number;
  depositAmount: number;
  remainingAmount: number;
  couponId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;

  salon: { id: string; name: string; ownerId: string };
  barber: { id: string; userId: string };
  service: { id: string; name: string; durationMinutes: number };
  client: { id: string; email: string; firstName: string | null; lastName: string | null };
  payments: import("./payment").Payment[];
  coupon: import("./coupon").Coupon | null;
  review: { id: string } | null;
}

export interface AvailableSlot {
  startAt: string;
  endAt: string;
}

export interface AvailabilityResponse {
  date: string;
  slots: AvailableSlot[];
}
