import type { Request, Response } from "express";
import { env } from "../config/env";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/app-error";
import { created, ok } from "../utils/api-response";

const secureCookie = env.NODE_ENV === "production";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/auth" });
}

function getRefreshToken(req: Request, bodyToken?: string): string {
  const token = bodyToken ?? (req.cookies?.refreshToken as string | undefined);
  if (!token) {
    throw AppError.unauthorized("Refresh token required");
  }
  return token;
}

export async function sendOtp(req: Request, res: Response) {
  const { phone, role } = req.body as { phone: string; role: import("@prisma/client").Role };
  const result = await authService.sendOtp(phone, role);
  return ok(res, result);
}

export async function verifyOtp(req: Request, res: Response) {
  const { phone, otp, role, firstName, lastName } = req.body as {
    phone: string;
    otp: string;
    role: import("@prisma/client").Role;
    firstName?: string;
    lastName?: string;
  };

  const session = await authService.verifyOtp({ phone, otp, role, firstName, lastName });
  setAuthCookies(res, session.tokens.accessToken, session.tokens.refreshToken);

  return created(res, {
    user: session.user,
    tokens: session.tokens,
    isNewUser: session.isNewUser,
  });
}

export async function refresh(req: Request, res: Response) {
  const bodyToken = (req.body as { refreshToken?: string }).refreshToken;
  const tokens = await authService.refreshSession(getRefreshToken(req, bodyToken));
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return ok(res, { tokens });
}

export async function logout(req: Request, res: Response) {
  const bodyToken = (req.body as { refreshToken?: string }).refreshToken;
  const refreshToken = bodyToken ?? (req.cookies?.refreshToken as string | undefined);

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearAuthCookies(res);
  return ok(res, { loggedOut: true });
}
