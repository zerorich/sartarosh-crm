import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/apiClient";
import { AdminSettings, AdminSettingsUpdatePayload } from "../model/types";

export const SETTING_KEYS = {
  all: ["settings"] as const,
  current: () => [...SETTING_KEYS.all, "current"] as const,
};

export function useAdminSettingsQuery() {
  return useQuery<AdminSettings>({
    queryKey: SETTING_KEYS.current(),
    queryFn: () => api.get<AdminSettings>("/admin/settings"),
  });
}

export function useUpdateAdminSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminSettingsUpdatePayload) =>
      api.patch<AdminSettings>("/admin/settings", data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(SETTING_KEYS.current(), updatedSettings);
    },
  });
}
