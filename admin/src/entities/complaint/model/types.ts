export type ComplaintStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
export type ComplaintCategory =
  | "BARBER_LATE"
  | "SERVICE_QUALITY"
  | "PAYMENT"
  | "SALON"
  | "OTHER";

export interface Complaint {
  id: string;
  clientId: string;
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
  salonId?: string | null;
  salon?: {
    id: string;
    name: string;
    phone?: string | null;
    address?: string;
  } | null;
  barberId?: string | null;
  barber?: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  bookingId?: string | null;
  category?: ComplaintCategory;
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
  status?: string;
  category?: string;
  search?: string;
}

export interface UpdateComplaintPayload {
  status: ComplaintStatus;
  adminNote?: string;
}
