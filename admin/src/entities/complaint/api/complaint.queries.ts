import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PaginatedResult } from "@/shared/api/apiClient";
import { Complaint, ComplaintListParams, UpdateComplaintPayload } from "../model/types";

export const COMPLAINT_KEYS = {
  all: ["complaints"] as const,
  lists: () => [...COMPLAINT_KEYS.all, "list"] as const,
  list: (params: ComplaintListParams) => [...COMPLAINT_KEYS.lists(), params] as const,
  details: () => [...COMPLAINT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...COMPLAINT_KEYS.details(), id] as const,
};

export function useComplaintsQuery(params: ComplaintListParams = { page: 1, limit: 20 }) {
  return useQuery<PaginatedResult<Complaint>>({
    queryKey: COMPLAINT_KEYS.list(params),
    queryFn: () => api.get<PaginatedResult<Complaint>>("/admin/complaints", params as any),
  });
}

export function useComplaintDetailQuery(complaintId: string) {
  return useQuery<Complaint>({
    queryKey: COMPLAINT_KEYS.detail(complaintId),
    queryFn: () => api.get<Complaint>(`/admin/complaints/${complaintId}`),
    enabled: !!complaintId,
  });
}

export function useUpdateComplaintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintId,
      data,
    }: {
      complaintId: string;
      data: UpdateComplaintPayload;
    }) => api.patch<Complaint>(`/admin/complaints/${complaintId}`, data),
    onSuccess: (updatedComplaint, { complaintId }) => {
      queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.lists() });
      queryClient.setQueryData(COMPLAINT_KEYS.detail(complaintId), updatedComplaint);
    },
  });
}
