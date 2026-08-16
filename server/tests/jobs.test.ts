import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  notification: { findUnique: vi.fn(), update: vi.fn() },
  coupon: { findMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
  auditLog: { findMany: vi.fn(), findFirst: vi.fn() },
  booking: { groupBy: vi.fn(), count: vi.fn(), findMany: vi.fn() },
  payment: { aggregate: vi.fn(), findMany: vi.fn() },
  user: { count: vi.fn() },
  review: { count: vi.fn() },
  complaint: { count: vi.fn() },
  salon: { findMany: vi.fn() },
  expense: { aggregate: vi.fn() },
  salonStaff: { findMany: vi.fn() },
}));

const writeAudit = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const deliverExternalChannels = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ inApp: "delivered", sms: "skipped", email: "skipped" }),
);

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/services/audit.service", () => ({ writeAudit }));
vi.mock("../src/integrations/notification.provider", () => ({ deliverExternalChannels }));

import { processCouponExpiration } from "../src/jobs/coupon-expiration.job";
import { processDailyReports } from "../src/jobs/daily-report.job";
import { processFinanceAggregation } from "../src/jobs/finance-aggregation.job";
import { processNotificationJob } from "../src/jobs/notification.job";
import { previousUtcDayRange } from "../src/utils/time";

describe("previousUtcDayRange", () => {
  it("returns the previous UTC calendar day", () => {
    const now = new Date("2026-08-16T08:42:00.000Z");
    const range = previousUtcDayRange(now);
    expect(range.dateKey).toBe("2026-08-15");
    expect(range.from.toISOString()).toBe("2026-08-15T00:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-08-16T00:00:00.000Z");
  });
});

describe("processNotificationJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delivers channels and marks the notification processed", async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({
      id: "n1",
      userId: "u1",
      type: "BOOKING_REMINDER",
      title: "Soon",
      body: "Starts soon",
      data: { bookingId: "b1" },
    });
    mockPrisma.notification.update.mockResolvedValue({});

    const result = await processNotificationJob({ notificationId: "n1" });

    expect(deliverExternalChannels).toHaveBeenCalledWith(
      expect.objectContaining({ id: "n1", userId: "u1" }),
    );
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: "n1" },
      data: {
        data: expect.objectContaining({
          bookingId: "b1",
          processedAt: expect.any(String),
          channels: { inApp: "delivered", sms: "skipped", email: "skipped" },
        }),
      },
    });
    expect(result).toMatchObject({ processed: true, notificationId: "n1" });
  });

  it("is idempotent when already processed", async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({
      id: "n1",
      data: { processedAt: "2026-08-16T00:00:00.000Z" },
    });

    const result = await processNotificationJob({ notificationId: "n1" });

    expect(result).toMatchObject({ skipped: true, reason: "already-processed" });
    expect(deliverExternalChannels).not.toHaveBeenCalled();
    expect(mockPrisma.notification.update).not.toHaveBeenCalled();
  });

  it("completes when the notification is missing", async () => {
    mockPrisma.notification.findUnique.mockResolvedValue(null);
    const result = await processNotificationJob({ notificationId: "missing" });
    expect(result).toMatchObject({ skipped: true, reason: "not-found" });
  });
});

describe("processCouponExpiration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks unused expired coupons via audit and does not delete them", async () => {
    const expiresAt = new Date("2026-08-01T00:00:00.000Z");
    mockPrisma.coupon.findMany.mockResolvedValue([
      { id: "c1", clientId: "u1", salonId: "s1", expiresAt },
      { id: "c2", clientId: "u2", salonId: "s1", expiresAt },
    ]);
    mockPrisma.auditLog.findMany.mockResolvedValue([{ entityId: "c1" }]);

    const result = await processCouponExpiration(new Date("2026-08-16T00:00:00.000Z"));

    expect(mockPrisma.coupon.findMany).toHaveBeenCalledWith({
      where: { usedAt: null, expiresAt: { lt: expect.any(Date) } },
      select: { id: true, clientId: true, salonId: true, expiresAt: true },
    });
    expect(writeAudit).toHaveBeenCalledTimes(1);
    expect(writeAudit).toHaveBeenCalledWith({
      action: "COUPON_EXPIRED",
      entityType: "Coupon",
      entityId: "c2",
      metadata: expect.objectContaining({ clientId: "u2", salonId: "s1" }),
    });
    expect(mockPrisma.coupon.delete).not.toHaveBeenCalled();
    expect(mockPrisma.coupon.deleteMany).not.toHaveBeenCalled();
    expect(result).toEqual({ expiredCount: 2, newlyMarked: 1 });
  });
});

describe("processDailyReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.booking.groupBy.mockResolvedValue([]);
    mockPrisma.booking.count.mockResolvedValue(0);
    mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 0 }, _count: { _all: 0 } });
    mockPrisma.payment.findMany.mockResolvedValue([]);
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.review.count.mockResolvedValue(0);
    mockPrisma.complaint.count.mockResolvedValue(0);
  });

  it("skips when the platform report already exists", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue({ id: "existing" });
    const result = await processDailyReports(new Date("2026-08-16T08:00:00.000Z"));
    expect(result).toEqual({ skipped: true, dateKey: "2026-08-15" });
    expect(writeAudit).not.toHaveBeenCalled();
  });

  it("writes platform and salon audits for the previous day", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.booking.groupBy
      .mockResolvedValueOnce([{ status: "COMPLETED", _count: { _all: 2 } }])
      .mockResolvedValueOnce([{ salonId: "salon-1", _count: { _all: 2 } }]);
    mockPrisma.booking.count.mockResolvedValue(2);
    mockPrisma.payment.aggregate.mockResolvedValue({
      _sum: { amount: 150000 },
      _count: { _all: 1 },
    });
    mockPrisma.payment.findMany.mockResolvedValue([
      { amount: 150000, booking: { salonId: "salon-1" } },
    ]);

    const result = await processDailyReports(new Date("2026-08-16T08:00:00.000Z"));

    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DAILY_REPORT_GENERATED",
        entityType: "Platform",
        entityId: "2026-08-15",
      }),
    );
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DAILY_REPORT_GENERATED",
        entityType: "Salon",
        entityId: "salon-1:2026-08-15",
      }),
    );
    expect(result).toMatchObject({ skipped: false, dateKey: "2026-08-15", salonReports: 1 });
  });
});

describe("processFinanceAggregation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores salon and platform finance snapshots in audit metadata", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.salon.findMany.mockResolvedValue([{ id: "salon-1", name: "Cut" }]);
    mockPrisma.payment.findMany.mockResolvedValue([{ amount: 200000 }]);
    mockPrisma.expense.aggregate.mockResolvedValue({
      _sum: { amount: 20000 },
      _count: { _all: 1 },
    });
    mockPrisma.booking.findMany.mockResolvedValue([{ price: 200000, barberId: "barber-1" }]);
    mockPrisma.salonStaff.findMany.mockResolvedValue([
      {
        barberId: "barber-1",
        salaryType: "PERCENTAGE",
        salaryFixed: 0,
        salaryPercent: 50,
        barber: { id: "barber-1", userId: "user-barber" },
      },
    ]);

    const result = await processFinanceAggregation(new Date("2026-08-16T08:00:00.000Z"));

    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "FINANCE_AGGREGATED",
        entityType: "Salon",
        entityId: "salon-1:2026-08-15",
        metadata: expect.objectContaining({
          revenue: 200000,
          expenses: 20000,
          salaryEstimate: 100000,
          profitEstimate: 80000,
        }),
      }),
    );
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "FINANCE_AGGREGATED",
        entityType: "Platform",
        entityId: "2026-08-15",
      }),
    );
    expect(result).toMatchObject({ skipped: false, dateKey: "2026-08-15", salonCount: 1 });
  });
});
