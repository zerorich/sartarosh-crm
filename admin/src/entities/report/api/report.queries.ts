import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/apiClient";
import { AdminReports } from "../model/types";

export const REPORT_KEYS = {
  all: ["reports"] as const,
  overview: () => [...REPORT_KEYS.all, "overview"] as const,
};

export function useAdminReportsQuery() {
  return useQuery<AdminReports>({
    queryKey: REPORT_KEYS.overview(),
    queryFn: () => api.get<AdminReports>("/admin/reports"),
  });
}
