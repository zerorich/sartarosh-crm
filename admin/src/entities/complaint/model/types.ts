export type ComplaintStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";

export interface Complaint {
  id: string;
  clientId: string;
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  salonId?: string | null;
  salon?: {
    id: string;
    name: string;
    phone?: string | null;
    address?: string;
  } | null;
  bookingId?: string | null;
  subject: string;
  body: string;
  status: ComplaintStatus;
  adminNote?: string | null;
  handledById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintListParams {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
}

export interface UpdateComplaintPayload {
  status?: ComplaintStatus;
  adminNote?: string;
}
