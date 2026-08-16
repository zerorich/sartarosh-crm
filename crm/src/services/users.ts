import { apiClient } from "./client";
import { API_URL } from "@/lib/env";
import { getAccessToken } from "@/lib/session";
import { ApiError, ERROR_CODES, type ApiResponse } from "@/types/api";
import type { User } from "@/types/user";

export function fetchMe() {
  return apiClient.get<User>("/users/me");
}

export function updateMe(input: { firstName?: string; lastName?: string; avatarUrl?: string | null }) {
  return apiClient.patch<User>("/users/me", input);
}

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
