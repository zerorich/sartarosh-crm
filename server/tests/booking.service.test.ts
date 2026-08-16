import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  salon: { findUnique: vi.fn() },
  salonStaff: { findUnique: vi.fn() },
  service: { findFirst: vi.fn() },
  barberService: { findUnique: vi.fn() },
  barberProfile: { findUnique: vi.fn() },
  booking: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  workingHour: { findMany: vi.fn() },
  blockedTime: { findMany: vi.fn() },
  coupon: { findUnique: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/services/notification.service", () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}));
vi.mock("../src/services/audit.service", () => ({
  writeAudit: vi.fn().mockResolvedValue({}),
}));

import { createBooking, markNoShow, startBooking } from "../src/services/booking.service";
import { assertSlotAvailable } from "../src/services/availability.service";
import {
  createBarberLateCoupon,
  markCouponUsed,
  validateCouponForBooking,
} from "../src/services/coupon.service";
import { createNotification } from "../src/services/notification.service";

vi.mock("../src/services/settings.service", () => ({
  getSettings: vi.fn().mockResolvedValue({
    noShowLimit: 3,
    noShowRestrictionDays: 14,
    barberDelayThreshold: 5,
    barberDelayCompensationPercent: new Decimal(10),
    couponExpirationDays: 30,
  }),
}));
vi.mock("../src/services/coupon.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/services/coupon.service")>();
  return {
    ...actual,
    createBarberLateCoupon: vi.fn(),
    validateCouponForBooking: vi.fn(),
    markCouponUsed: vi.fn(),
  };
});

function setupValidBookingContext() {
  mockPrisma.user.findUnique.mockResolvedValue({
    id: "client-1",
    restrictedUntil: null,
  });
  mockPrisma.salon.findUnique.mockResolvedValue({
    id: "salon-1",
    name: "Test Salon",
    status: "ACTIVE",
    depositType: "PERCENTAGE",
    depositValue: new Decimal(25),
  });
  mockPrisma.salonStaff.findUnique.mockResolvedValue({ status: "ACTIVE" });
  mockPrisma.service.findFirst.mockResolvedValue({
    id: "service-1",
    price: new Decimal(100),
    durationMinutes: 60,
    isActive: true,
  });
  mockPrisma.barberService.findUnique.mockResolvedValue({ id: "bs-1" });
  mockPrisma.workingHour.findMany.mockImplementation(({ where }: { where: { salonId?: string } }) => {
    if (where.salonId) {
      return Promise.resolve([{ startTime: "09:00", endTime: "18:00", dayOfWeek: 0 }]);
    }
    return Promise.resolve([{ startTime: "09:00", endTime: "18:00", dayOfWeek: 0 }]);
  });
  mockPrisma.blockedTime.findMany.mockResolvedValue([]);
  mockPrisma.booking.findMany.mockResolvedValue([]);
  mockPrisma.booking.count.mockResolvedValue(0);
  mockPrisma.barberProfile.findUnique.mockResolvedValue({ userId: "barber-user-1" });
}

describe("BookingService.createBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupValidBookingContext();
  });

  it("creates booking with price snapshot and deposit", async () => {
    const startAt = new Date("2026-08-16T10:00:00");
    const createdBooking = {
      id: "booking-1",
      clientId: "client-1",
      salonId: "salon-1",
      barberId: "barber-1",
      serviceId: "service-1",
      status: "PENDING",
      startAt,
      endAt: new Date("2026-08-16T11:00:00"),
      scheduledStartAt: startAt,
      price: new Decimal(100),
      depositAmount: new Decimal(25),
      remainingAmount: new Decimal(75),
      salon: { id: "salon-1", name: "Test Salon", ownerId: "owner-1" },
      barber: { id: "barber-1", userId: "barber-user-1" },
      service: { id: "service-1", name: "Cut", durationMinutes: 60 },
      client: { id: "client-1", email: "client@example.com", firstName: "A", lastName: "B" },
      payments: [],
      coupon: null,
    };

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      mockPrisma.$executeRaw.mockResolvedValue(undefined);
      mockPrisma.booking.count.mockResolvedValue(0);
      return fn(mockPrisma);
    });
    mockPrisma.booking.create.mockResolvedValue(createdBooking);

    const result = await createBooking({
      clientId: "client-1",
      salonId: "salon-1",
      barberId: "barber-1",
      serviceId: "service-1",
      startAt,
    });

    expect(result.price).toBe(100);
    expect(result.depositAmount).toBe(25);
    expect(result.remainingAmount).toBe(75);
    expect(createNotification).toHaveBeenCalled();
  });

  it("applies coupon discount and marks coupon as used", async () => {
    const startAt = new Date("2026-08-16T10:00:00");
    vi.mocked(validateCouponForBooking).mockResolvedValue({
      id: "coupon-1",
      type: "PERCENTAGE",
      value: new Decimal(10),
    } as never);

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      mockPrisma.$executeRaw.mockResolvedValue(undefined);
      mockPrisma.booking.count.mockResolvedValue(0);
      return fn(mockPrisma);
    });
    mockPrisma.booking.create.mockResolvedValue({
      id: "booking-1",
      price: new Decimal(90),
      depositAmount: new Decimal(22.5),
      remainingAmount: new Decimal(67.5),
      couponId: "coupon-1",
      salon: { id: "salon-1", name: "Test Salon", ownerId: "owner-1" },
      barber: { id: "barber-1", userId: "barber-user-1" },
      service: { id: "service-1", name: "Cut", durationMinutes: 60 },
      client: { id: "client-1", email: "client@example.com", firstName: "A", lastName: "B" },
      payments: [],
      coupon: null,
    });

    await createBooking({
      clientId: "client-1",
      salonId: "salon-1",
      barberId: "barber-1",
      serviceId: "service-1",
      startAt,
      couponId: "coupon-1",
    });

    expect(mockPrisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          price: 90,
          couponId: "coupon-1",
        }),
      }),
    );
    expect(markCouponUsed).toHaveBeenCalledWith("coupon-1", mockPrisma);
  });

  it("rejects double booking when slot overlap exists", async () => {
    mockPrisma.booking.count.mockResolvedValue(1);

    await expect(
      assertSlotAvailable({
        salonId: "salon-1",
        barberId: "barber-1",
        startAt: new Date("2026-08-16T10:00:00"),
        endAt: new Date("2026-08-16T11:00:00"),
      }),
    ).rejects.toMatchObject({ code: "BOOKING_SLOT_UNAVAILABLE" });
  });
});

describe("BookingService.markNoShow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments no-show counter and applies restriction at limit", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      clientId: "client-1",
      status: "CONFIRMED",
    });
    mockPrisma.$transaction.mockResolvedValue([
      {
        id: "booking-1",
        status: "NO_SHOW",
        price: new Decimal(100),
        depositAmount: new Decimal(25),
        remainingAmount: new Decimal(75),
        salon: { id: "salon-1", name: "S", ownerId: "o" },
        barber: { id: "b", userId: "u" },
        service: { id: "s", name: "Cut", durationMinutes: 60 },
        client: { id: "client-1", email: "client@example.com", firstName: "A", lastName: "B" },
        payments: [],
        coupon: null,
      },
      { noShowCount: 3 },
    ]);
    mockPrisma.user.update.mockResolvedValue({});

    await markNoShow("booking-1");

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "client-1" },
        data: expect.objectContaining({ restrictedUntil: expect.any(Date) }),
      }),
    );
  });
});

describe("BookingService.startBooking barber delay coupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates compensation coupon when delay exceeds threshold", async () => {
    const scheduled = new Date(Date.now() - 10 * 60_000);
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      clientId: "client-1",
      salonId: "salon-1",
      status: "ARRIVED",
      scheduledStartAt: scheduled,
    });
    mockPrisma.booking.update.mockResolvedValue({
      id: "booking-1",
      clientId: "client-1",
      salonId: "salon-1",
      status: "IN_PROGRESS",
      delayMinutes: 10,
      price: new Decimal(100),
      depositAmount: new Decimal(25),
      remainingAmount: new Decimal(75),
      salon: { id: "salon-1", name: "S", ownerId: "o" },
      barber: { id: "b", userId: "u" },
      service: { id: "s", name: "Cut", durationMinutes: 60 },
      client: { id: "client-1", email: "client@example.com", firstName: "A", lastName: "B" },
      payments: [],
      coupon: null,
    });

    vi.mocked(createBarberLateCoupon).mockResolvedValue({
      id: "coupon-1",
      type: "PERCENTAGE",
      value: new Decimal(10),
    } as never);

    await startBooking("booking-1");

    expect(createBarberLateCoupon).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: "client-1",
        sourceBookingId: "booking-1",
        percent: 10,
      }),
    );
  });
});
