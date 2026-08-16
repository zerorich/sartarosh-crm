import { api } from "@/shared/api/apiClient";
import { AdminSettings, AdminSettingsUpdatePayload } from "@/entities/setting/model/types";

export const settingsService = {
  get: () => api.get<AdminSettings>("/admin/settings"),

  update: (data: AdminSettingsUpdatePayload) =>
    api.patch<AdminSettings>("/admin/settings", data),
};
