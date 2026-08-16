import { apiClient } from "./client";
import { API_URL } from "@/lib/env";
import { getAccessToken } from "@/lib/session";
import { ApiError, ERROR_CODES, type ApiResponse } from "@/types/api";
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

/** multipart/form-data — apiClient's JSON-only wrapper doesn't fit file uploads. */
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAccessToken();
  const res = await fetch(`${API_URL}/uploads/image`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const json = (await res.json().catch(() => undefined)) as ApiResponse<{ url: string }> | undefined;

  if (!res.ok || !json || json.success === false) {
    const code = json && json.success === false ? json.code : ERROR_CODES.INTERNAL_ERROR;
    const message = json && json.success === false ? json.message : `Server xatosi (${res.status})`;
    throw new ApiError(message, code, res.status);
  }

  return json.data;
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
