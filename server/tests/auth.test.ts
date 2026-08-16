import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "../src/types";
import { hashValue } from "../src/utils/crypto";

const mockRedis = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
  ttl: vi.fn(),
}));

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
  clientProfile: { create: vi.fn() },
  refreshToken: { create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("../src/config/redis", () => ({ redis: mockRedis }));
vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));

import { env } from "../src/config/env";
import { sendOtp, verifyOtp } from "../src/services/auth.service";

const phone = "+998901234567";

function existingUser() {
  return {
    id: "user-1",
    phone,
    role: "CLIENT" as const,
    firstName: "Ali",
    lastName: "Vali",
    avatarUrl: null,
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 0,
    restrictedUntil: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
}

describe("AuthService.sendOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.set.mockResolvedValue("OK");
  });

  it("sends OTP and stores a hashed record", async () => {
    mockRedis.incr.mockResolvedValue(1);

    const result = await sendOtp(phone, "CLIENT");

    expect(result.phone).toBe(phone);
    expect(result.expiresInSeconds).toBe(env.OTP_TTL_SECONDS);
    expect(result.debugOtp).toMatch(/^\d{6}$/);
    expect(mockRedis.set).toHaveBeenCalledWith(
      `otp:${phone}`,
      expect.any(String),
      "EX",
      env.OTP_TTL_SECONDS,
    );
  });

  it("rejects OTP send after the rate limit is exceeded", async () => {
    mockRedis.incr.mockResolvedValue(4);

    await expect(sendOtp(phone, "CLIENT")).rejects.toMatchObject({
      statusCode: 400,
      code: ERROR_CODES.RATE_LIMITED,
    });
    expect(mockRedis.set).not.toHaveBeenCalled();
  });
});

describe("AuthService.verifyOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.del.mockResolvedValue(1);
    mockPrisma.refreshToken.create.mockResolvedValue({ id: "rt-1" });
  });

  it("verifies a valid OTP and issues tokens for an existing user", async () => {
    const otp = "123456";
    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        hash: hashValue(otp, env.OTP_SECRET),
        role: "CLIENT",
        attempts: 0,
      }),
    );
    mockPrisma.user.findUnique.mockResolvedValue(existingUser());

    const session = await verifyOtp({ phone, otp, role: "CLIENT" });

    expect(session.isNewUser).toBe(false);
    expect(session.user.id).toBe("user-1");
    expect(session.user.phone).toBe(phone);
    expect(session.tokens.accessToken).toEqual(expect.any(String));
    expect(session.tokens.refreshToken).toEqual(expect.any(String));
    expect(mockPrisma.refreshToken.create).toHaveBeenCalledOnce();
    expect(mockRedis.del).toHaveBeenCalledWith(`otp:${phone}`);
  });

  it("creates a new user when the phone is unknown", async () => {
    const otp = "654321";
    const created = existingUser();
    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        hash: hashValue(otp, env.OTP_SECRET),
        role: "CLIENT",
        attempts: 0,
      }),
    );
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      mockPrisma.user.create.mockResolvedValue(created);
      mockPrisma.clientProfile.create.mockResolvedValue({ id: "cp-1" });
      return fn(mockPrisma);
    });

    const session = await verifyOtp({ phone, otp, role: "CLIENT", firstName: "Ali" });

    expect(session.isNewUser).toBe(true);
    expect(session.user.id).toBe("user-1");
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(mockPrisma.clientProfile.create).toHaveBeenCalledWith({
      data: { userId: "user-1" },
    });
  });
});
