import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Review, ReviewListParams } from "@/entities/review/model/types";

export const reviewsService = {
  getAll: (params: ReviewListParams = { page: 1, limit: 20 }) =>
    api.get<PaginatedResult<Review>>("/admin/reviews", params as any),

  hide: (id: string) =>
    api.patch<Review>(`/admin/reviews/${id}/hide`, {}),

  restore: (id: string) =>
    api.patch<Review>(`/admin/reviews/${id}/restore`, {}),

  remove: (id: string) =>
    api.delete<Review>(`/admin/reviews/${id}`),
};
