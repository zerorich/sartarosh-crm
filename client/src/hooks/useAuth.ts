"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as authService from "@/services/auth";
import { fetchMe, updateMe } from "@/services/users";
import { ApiError } from "@/types/api";

export const ME_QUERY_KEY = ["me"] as const;

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
    staleTime: 60_000,
  });
}

export function useAuth() {
  const { data: user, isLoading, isError } = useMe();
  return {
    user: user ?? null,
    isAuthenticated: Boolean(user),
    isLoading,
    isError,
  };
}

export function useSendOtp() {
  return useMutation({
    mutationFn: authService.sendOtp,
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (session) => {
      queryClient.setQueryData(ME_QUERY_KEY, session.user);
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.clear();
      router.replace("/");
    },
  });
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
