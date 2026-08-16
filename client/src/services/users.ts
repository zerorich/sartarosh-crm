import { apiClient } from "./client";
import type { Coupon } from "@/types/coupon";
import type { MyReview } from "@/types/my-review";
import type { Salon } from "@/types/salon";
import type { User } from "@/types/user";

export function fetchMe() {
  return apiClient.get<User>("/users/me");
}

export function updateMe(input: { firstName?: string; lastName?: string; avatarUrl?: string | null }) {
  return apiClient.patch<User>("/users/me", input);
}

export function fetchMyCoupons() {
  return apiClient.get<Coupon[]>("/users/me/coupons");
}

export function fetchMyReviews() {
  return apiClient.get<MyReview[]>("/users/me/reviews");
}

export function fetchSavedSalons() {
  return apiClient.get<Salon[]>("/users/me/saved-salons");
}

export function saveSalon(salonId: string) {
  return apiClient.put<{ salonId: string; saved: boolean }>(`/users/me/saved-salons/${salonId}`);
}

export function unsaveSalon(salonId: string) {
  return apiClient.delete<{ salonId: string; saved: boolean }>(`/users/me/saved-salons/${salonId}`);
}
