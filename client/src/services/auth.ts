import { apiClient } from "./client";
import type { AuthSession } from "@/types/user";

export interface SendOtpResult {
  phone: string;
  expiresInSeconds: number;
  /** Faqat development'da backend shu maydonni qaytaradi (real SMS yo'q). */
  debugOtp?: string;
}

export function sendOtp(phone: string) {
  return apiClient.post<SendOtpResult>("/auth/send-otp", { phone });
}

export function verifyOtp(input: {
  phone: string;
  otp: string;
  firstName?: string;
  lastName?: string;
}) {
  return apiClient.post<AuthSession>("/auth/verify-otp", input);
}

export function logout() {
  return apiClient.post<{ loggedOut: boolean }>("/auth/logout", {}, { skipAuthRetry: true });
}
