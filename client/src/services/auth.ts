import { clearAuthTokens, getRefreshToken } from "@/lib/session";
import { apiClient } from "./client";
import type { AuthSession } from "@/types/user";

export interface SendOtpResult {
  email: string;
  expiresInSeconds: number;
  /** Faqat development'da backend shu maydonni qaytaradi (real email yo'q). */
  debugOtp?: string;
}

export function sendOtp(email: string) {
  return apiClient.post<SendOtpResult>("/auth/send-otp", { email });
}

export function verifyOtp(input: {
  email: string;
  otp: string;
  firstName?: string;
  lastName?: string;
}) {
  return apiClient.post<AuthSession>("/auth/verify-otp", input);
}

export async function logout() {
  try {
    return await apiClient.post<{ loggedOut: boolean }>(
      "/auth/logout",
      { refreshToken: getRefreshToken() ?? undefined },
      { skipAuthRetry: true },
    );
  } finally {
    clearAuthTokens();
  }
}
