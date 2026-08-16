export type AdminUser = {
  id: string;
  phone: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

const TOKEN_KEY = "cutzone_admin_token";
const REFRESH_TOKEN_KEY = "cutzone_admin_refresh_token";
const USER_KEY = "cutzone_admin_user";

export function saveSession(
  accessToken: string,
  refreshToken: string,
  user: AdminUser
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSessionUser(): AdminUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminUser;
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.phone === "string" &&
      typeof parsed.role === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAdminRole(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
