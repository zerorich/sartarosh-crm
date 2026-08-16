import type { Role, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";
import { addDuration } from "../utils/duration";
import { generateOtp, hashValue, randomToken, safeEqual } from "../utils/crypto";

const SIGNUP_ROLES: Role[] = ["CLIENT", "BARBER", "OWNER"];

const OTP_SEND_WINDOW_SECONDS = 900;
const OTP_SEND_MAX = 3;

interface AccessPayload {
  sub: string;
  role: Role;
  typ: "access";
}

interface OtpRecord {
  hash: string;
  role: Role;
  attempts: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUserView {
  id: string;
  phone: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;
  noShowCount: number;
  restrictedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: AuthUserView;
  tokens: AuthTokens;
  isNewUser: boolean;
}

function otpKey(phone: string) {
  return `otp:${phone}`;
}

function otpSendKey(phone: string) {
  return `otp:send:${phone}`;
}

function normalizeSignupRole(role: Role): Role {
  if (!SIGNUP_ROLES.includes(role)) {
    throw AppError.badRequest("Invalid signup role", ERROR_CODES.VALIDATION_ERROR);
  }
  return role;
}

async function assertSendRateLimit(phone: string) {
  const key = otpSendKey(phone);
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, OTP_SEND_WINDOW_SECONDS);
  }

  if (count > OTP_SEND_MAX) {
    throw AppError.badRequest("Too many OTP requests. Try again later.", ERROR_CODES.RATE_LIMITED);
  }
}

function issueAccessToken(user: Pick<User, "id" | "role">): string {
  const payload: AccessPayload = {
    sub: user.id,
    role: user.role,
    typ: "access",
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
    issuer: "sartarosh",
    audience: "sartarosh",
  });
}

async function issueRefreshToken(userId: string): Promise<string> {
  const rawToken = randomToken();
  const tokenHash = hashValue(rawToken, env.JWT_REFRESH_SECRET);
  const expiresAt = addDuration(new Date(), env.REFRESH_TOKEN_TTL);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    phone: user.phone,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    isBlocked: user.isBlocked,
    noShowCount: user.noShowCount,
    restrictedUntil: user.restrictedUntil,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function sendOtp(phone: string, role: Role) {
  const signupRole = normalizeSignupRole(role);

  await assertSendRateLimit(phone);

  const otp = generateOtp();
  const hash = hashValue(otp, env.OTP_SECRET);

  const record: OtpRecord = {
    hash,
    role: signupRole,
    attempts: 0,
  };

  await redis.set(otpKey(phone), JSON.stringify(record), "EX", env.OTP_TTL_SECONDS);

  if (env.NODE_ENV !== "production") {
    console.info(`[auth] OTP for ${phone}: ${otp}`);
  }

  return {
    phone,
    expiresInSeconds: env.OTP_TTL_SECONDS,
    ...(env.NODE_ENV !== "production" ? { debugOtp: otp } : {}),
  };
}

export async function verifyOtp(params: {
  phone: string;
  otp: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}): Promise<AuthSession> {
  const signupRole = normalizeSignupRole(params.role);
  const raw = await redis.get(otpKey(params.phone));

  if (!raw) {
    throw AppError.badRequest("OTP expired or not found", ERROR_CODES.OTP_EXPIRED);
  }

  const record = JSON.parse(raw) as OtpRecord;

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    await redis.del(otpKey(params.phone));
    throw AppError.badRequest("Too many invalid OTP attempts", ERROR_CODES.RATE_LIMITED);
  }

  const submittedHash = hashValue(params.otp, env.OTP_SECRET);

  if (!safeEqual(record.hash, submittedHash)) {
    record.attempts += 1;
    const ttl = await redis.ttl(otpKey(params.phone));
    if (ttl > 0) {
      await redis.set(otpKey(params.phone), JSON.stringify(record), "EX", ttl);
    }
    throw AppError.badRequest("Invalid OTP", ERROR_CODES.OTP_INVALID);
  }

  await redis.del(otpKey(params.phone));

  let isNewUser = false;
  let user = await prisma.user.findUnique({ where: { phone: params.phone } });

  if (!user) {
    isNewUser = true;
    const effectiveRole = record.role ?? signupRole;

    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          phone: params.phone,
          role: effectiveRole,
          firstName: params.firstName,
          lastName: params.lastName,
        },
      });

      switch (effectiveRole) {
        case "CLIENT":
          await tx.clientProfile.create({ data: { userId: created.id } });
          break;
        case "BARBER":
          await tx.barberProfile.create({ data: { userId: created.id } });
          break;
        case "OWNER":
          await tx.ownerProfile.create({ data: { userId: created.id } });
          break;
      }

      return created;
    });
  } else {
    if (user.isBlocked) {
      throw AppError.forbidden("User is blocked", ERROR_CODES.USER_BLOCKED);
    }

    if (params.firstName || params.lastName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: params.firstName ?? user.firstName,
          lastName: params.lastName ?? user.lastName,
        },
      });
    }
  }

  const accessToken = issueAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);

  return {
    user: sanitizeUser(user),
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: env.ACCESS_TOKEN_TTL,
    },
    isNewUser,
  };
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const tokenHash = hashValue(refreshToken, env.JWT_REFRESH_SECRET);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  if (stored.user.isBlocked) {
    throw AppError.forbidden("User is blocked", ERROR_CODES.USER_BLOCKED);
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = issueAccessToken(stored.user);
  const newRefreshToken = await issueRefreshToken(stored.userId);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: env.ACCESS_TOKEN_TTL,
  };
}

export async function logout(refreshToken: string) {
  const tokenHash = hashValue(refreshToken, env.JWT_REFRESH_SECRET);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });

  return { loggedOut: true };
}

export async function logoutAll(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });

  return { loggedOut: true };
}
