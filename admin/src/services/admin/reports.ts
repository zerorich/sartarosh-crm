import { api } from "@/shared/api/apiClient";
import { AdminReports } from "@/entities/report/model/types";

export const reportsService = {
  get: (dateRange?: string) =>
    api.get<AdminReports>("/admin/reports", dateRange ? { dateRange } : undefined),
};
