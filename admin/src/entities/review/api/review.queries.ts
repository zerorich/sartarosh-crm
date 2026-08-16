import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Review, ReviewListParams } from "../model/types";

export const REVIEW_KEYS = {
  all: ["reviews"] as const,
  lists: () => [...REVIEW_KEYS.all, "list"] as const,
  list: (params: ReviewListParams) => [...REVIEW_KEYS.lists(), params] as const,
};

export function useReviewsQuery(params: ReviewListParams = { page: 1, limit: 20 }) {
  return useQuery<PaginatedResult<Review>>({
    queryKey: REVIEW_KEYS.list(params),
    queryFn: () => api.get<PaginatedResult<Review>>("/admin/reviews", params as any),
  });
}

export function useHideReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      api.patch<Review>(`/admin/reviews/${reviewId}/hide`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.lists() });
    },
  });
}

export function useRestoreReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      api.patch<Review>(`/admin/reviews/${reviewId}/restore`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.lists() });
    },
  });
}
