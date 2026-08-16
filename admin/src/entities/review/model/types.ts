export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
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
  barberRating: number;
  salonRating: number;
  serviceRating: number;
  comment?: string | null;
  isHidden: boolean;
  createdAt: string;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  includeHidden?: boolean;
}
