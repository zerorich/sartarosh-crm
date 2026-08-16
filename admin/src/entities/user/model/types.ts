export type UserRole = "CLIENT" | "BARBER" | "OWNER" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;
  blockedAt: string | null;
  blockReason?: string | null;
  noShowCount: number;
  restrictedUntil?: string | null;
  createdAt: string;
  updatedAt?: string;
  clientProfile?: { id: string } | null;
  barberProfile?: { id: string; rating: number; reviewCount: number } | null;
  ownerProfile?: { id: string } | null;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface BlockUserPayload {
  userId: string;
  block: boolean;
  reason?: string;
}
