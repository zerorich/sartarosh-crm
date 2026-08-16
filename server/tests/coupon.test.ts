import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = vi.hoisted(() => ({
  coupon: { findUnique: vi.fn() },
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));

import {
  computeDiscountedPrice,
  validateCouponForBooking,
} from "../src/services/coupon.service";

describe("CouponService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies percentage discount to booking price", () => {
    const discounted = computeDiscountedPrice(100_000, {
      type: "PERCENTAGE",
      value: new Decimal(10),
    });
    expect(discounted).toBe(90_000);
  });

  it("rejects already used coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "coupon-1",
      clientId: "client-1",
      salonId: "salon-1",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 86_400_000),
    });

    await expect(
      validateCouponForBooking("coupon-1", "client-1", "salon-1"),
    ).rejects.toMatchObject({ code: "COUPON_INVALID" });
  });

  it("accepts valid coupon for client and salon", async () => {
    const coupon = {
      id: "coupon-1",
      clientId: "client-1",
      salonId: "salon-1",
      type: "PERCENTAGE",
      value: new Decimal(10),
      usedAt: null,
      expiresAt: new Date(Date.now() + 86_400_000),
    };
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon);

    const result = await validateCouponForBooking("coupon-1", "client-1", "salon-1");
    expect(result.id).toBe("coupon-1");
  });
});
