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
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl?: string | null;
  };
  salonId: string;
  salon: {
    id: string;
    name: string;
    address?: string;
    phone?: string | null;
  };
  barberId: string;
  barber: {
    id: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      avatarUrl?: string | null;
    };
  };
  serviceId?: string;
  service: {
    id: string;
    name: string;
    durationMinutes?: number;
    price: number | string;
  };
  status: BookingStatus;
  startAt: string;
  endAt: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  delayMinutes?: number;
  compensationPercent?: number;
  price: number | string;
  depositAmount: number | string;
  remainingAmount: number | string;
  couponId?: string | null;
  coupon?: {
    id: string;
    reason?: string;
    type: string;
    value: number;
    expiresAt?: string;
  } | null;
  payments?: Array<{
    id: string;
    amount: number;
    method: "ONLINE" | "CASH" | "CARD";
    type: "DEPOSIT" | "REMAINING" | "FULL";
    status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
    providerRef?: string | null;
    createdAt: string;
  }>;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  status?: string;
  salonId?: string;
}
