import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { User, UserListParams, BlockUserPayload } from "../model/types";

export const USER_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (params: UserListParams) => [...USER_KEYS.lists(), params] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
};

export function useUsersQuery(params: UserListParams = { page: 1, limit: 20 }) {
  const { page, limit, role, search } = params;
  return useQuery<PaginatedResult<User>>({
    queryKey: USER_KEYS.list(params),
    queryFn: () => api.get<PaginatedResult<User>>("/admin/users", { page, limit, role, search }),
  });
}

export function useUserDetailQuery(userId: string) {
  return useQuery<User>({
    queryKey: USER_KEYS.detail(userId),
    queryFn: () => api.get<User>(`/admin/users/${userId}`),
    enabled: !!userId,
  });
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      api.patch<User>(`/admin/users/${userId}/block`, { block: true, reason }),
    onSuccess: (updatedUser, { userId }) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.setQueryData(USER_KEYS.detail(userId), updatedUser);
    },
  });
}

export function useUnblockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.patch<User>(`/admin/users/${userId}/unblock`),
    onSuccess: (updatedUser, userId) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.setQueryData(USER_KEYS.detail(userId), updatedUser);
    },
  });
}
