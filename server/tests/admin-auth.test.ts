import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { authorize } from "../src/middleware/authorize";
import { AppError } from "../src/utils/app-error";

const mockPrisma = vi.hoisted(() => ({
  salon: { findUnique: vi.fn() },
  expense: { findMany: vi.fn(), count: vi.fn() },
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));

function runAuthorize(roles: Parameters<typeof authorize>[0][], userRole: string) {
  const middleware = authorize(...roles);
  const req = { user: { id: "u1", email: "user@example.com", role: userRole, isBlocked: false } } as Request;
  const res = {} as Response;
  let error: unknown;
  const next: NextFunction = (err) => {
    error = err;
  };
  middleware(req, res, next);
  return error;
}

describe("Authorization", () => {
  it("allows ADMIN for admin-only routes", () => {
    const error = runAuthorize(["ADMIN", "SUPER_ADMIN"], "ADMIN");
    expect(error).toBeUndefined();
  });

  it("allows SUPER_ADMIN for admin-only routes", () => {
    const error = runAuthorize(["ADMIN", "SUPER_ADMIN"], "SUPER_ADMIN");
    expect(error).toBeUndefined();
  });

  it("denies CLIENT for admin routes", () => {
    const error = runAuthorize(["ADMIN", "SUPER_ADMIN"], "CLIENT");
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(403);
  });

  it("denies OWNER for admin routes", () => {
    const error = runAuthorize(["ADMIN", "SUPER_ADMIN"], "OWNER");
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(403);
  });

  it("allows OWNER for finance routes", () => {
    const error = runAuthorize(["OWNER", "ADMIN", "SUPER_ADMIN"], "OWNER");
    expect(error).toBeUndefined();
  });

  it("denies BARBER for finance routes", () => {
    const error = runAuthorize(["OWNER", "ADMIN", "SUPER_ADMIN"], "BARBER");
    expect(error).toBeInstanceOf(AppError);
  });
});

describe("Owner salon access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("owner cannot access another owner's salon", async () => {
    mockPrisma.salon.findUnique.mockResolvedValue({
      id: "s1",
      ownerId: "owner-profile-2",
    });

    const { listExpenses } = await import("../src/services/finance.service");

    await expect(
      listExpenses({
        salonId: "s1",
        user: { role: "OWNER", ownerProfileId: "owner-profile-1" },
        page: 1,
        limit: 20,
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("admin can access any salon", async () => {
    mockPrisma.salon.findUnique.mockResolvedValue({
      id: "s1",
      ownerId: "owner-profile-2",
    });
    mockPrisma.expense.findMany.mockResolvedValue([]);
    mockPrisma.expense.count.mockResolvedValue(0);

    const { listExpenses } = await import("../src/services/finance.service");

    const result = await listExpenses({
      salonId: "s1",
      user: { role: "ADMIN" },
      page: 1,
      limit: 20,
    });

    expect(result.total).toBe(0);
  });
});
