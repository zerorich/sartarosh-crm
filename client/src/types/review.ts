export interface ReviewAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string | null;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  salonId: string;
  barberId: string;
  serviceId: string;
  barberRating: number;
  salonRating: number;
  serviceRating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  client: ReviewAuthor;
}

export interface CreateReviewInput {
  bookingId: string;
  barberRating: number;
  salonRating: number;
  serviceRating: number;
  comment?: string;
}
