import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Complaint, ComplaintListParams, UpdateComplaintPayload } from "@/entities/complaint/model/types";

export const complaintsService = {
  getAll: (params: ComplaintListParams = { page: 1, limit: 20 }) =>
    api.get<PaginatedResult<Complaint>>("/admin/complaints", params as any),

  getById: (id: string) =>
    api.get<Complaint>(`/admin/complaints/${id}`),

  update: (id: string, data: UpdateComplaintPayload) =>
    api.patch<Complaint>(`/admin/complaints/${id}`, data),
};
