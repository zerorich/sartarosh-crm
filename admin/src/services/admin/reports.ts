import { api } from "@/shared/api/apiClient";
import { AdminReports } from "@/entities/report/model/types";

export const reportsService = {
  get: () => api.get<AdminReports>("/admin/reports"),
};
