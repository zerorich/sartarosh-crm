export interface MyReview {
  id: string;
  bookingId: string;
  barberRating: number;
  salonRating: number;
  serviceRating: number;
  comment: string | null;
  createdAt: string;
  salon: { id: string; name: string };
  barber: { id: string; user: { firstName: string | null; lastName: string | null } };
  service: { id: string; name: string };
}
