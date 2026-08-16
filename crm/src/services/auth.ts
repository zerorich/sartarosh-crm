import { apiClient } from "./client";
import type { AuthSession, Role } from "@/types/user";

export interface SendOtpResult {
  phone: string;
  expiresInSeconds: number;
  debugOtp?: string;
}

export function sendOtp(phone: string, role: Role) {
  return apiClient.post<SendOtpResult>("/auth/send-otp", { phone, role });
}

export function verifyOtp(input: {
  phone: string;
  otp: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}) {
  return apiClient.post<AuthSession>("/auth/verify-otp", input);
}

export function logout() {
  return apiClient.post<{ loggedOut: boolean }>("/auth/logout", {}, { skipAuthRetry: true });
}
