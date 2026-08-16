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
    phone: string;
  };
  salonId: string;
  salon: {
    id: string;
    name: string;
  };
  barberId: string;
  barber: {
    id: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
  service: {
    id: string;
    name: string;
    price: number | string;
  };
  status: BookingStatus;
  startAt: string;
  endAt: string;
  price: number;
  depositAmount: number;
  remainingAmount: number;
  createdAt: string;
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  status?: string;
  salonId?: string;
}
