export type Role = "CLIENT" | "BARBER" | "OWNER" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  phone: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;
  noShowCount: number;
  restrictedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}
