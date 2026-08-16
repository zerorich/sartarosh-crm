import { apiClient } from "./client";
import type { Paginated } from "@/types/api";
import type { CreateReviewInput, Review } from "@/types/review";

export function createReview(input: CreateReviewInput) {
  return apiClient.post<Review>("/reviews", input);
}

export function updateReview(id: string, input: Partial<Omit<CreateReviewInput, "bookingId">>) {
  return apiClient.patch<Review>(`/reviews/${id}`, input);
}

export function fetchSalonReviews(salonId: string, query: { page?: number; limit?: number } = {}) {
  return apiClient.get<Paginated<Review>>(`/salons/${salonId}/reviews`, query);
}

export function fetchBarberReviews(barberId: string, query: { page?: number; limit?: number } = {}) {
  return apiClient.get<Paginated<Review>>(`/barbers/${barberId}/reviews`, query);
}
