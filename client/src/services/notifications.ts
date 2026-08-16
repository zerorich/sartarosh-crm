import { apiClient } from "./client";
import type { Paginated } from "@/types/api";
import type { AppNotification } from "@/types/notification";

export function fetchNotifications(query: { page?: number; limit?: number } = {}) {
  return apiClient.get<Paginated<AppNotification>>("/notifications", query);
}

export function markNotificationRead(id: string) {
  return apiClient.patch<AppNotification>(`/notifications/${id}/read`);
}
