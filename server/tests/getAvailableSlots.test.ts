import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  service: { findFirst: vi.fn() },
  booking: { findMany: vi.fn() },
}));

const mockWorkingHourRepository = vi.hoisted(() => ({
  findBySalon: vi.fn(),
  findByBarber: vi.fn(),
}));

const mockBlockedTimeRepository = vi.hoisted(() => ({
  findBySalon: vi.fn(),
  findByBarber: vi.fn(),
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/repositories/working-hour.repository", () => ({
  workingHourRepository: mockWorkingHourRepository,
}));
vi.mock("../src/repositories/blocked-time.repository", () => ({
  blockedTimeRepository: mockBlockedTimeRepository,
}));

import { getAvailableSlots } from "../src/services/availability.service";

// A Monday in the (fixed) test range, well within the 09:00-20:00 window.
// Slots are enumerated in salon-local time (Asia/Tashkent, UTC+5) regardless of the
// host machine's timezone, so use an explicit +05:00 offset for all fixture dates.
const MONDAY = new Date("2026-08-17T00:00:00+05:00");

describe("getAvailableSlots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.service.findFirst.mockResolvedValue({
      id: "svc-1",
      salonId: "salon-1",
      durationMinutes: 60,
      isActive: true,
    });
    mockWorkingHourRepository.findBySalon.mockResolvedValue([
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
    ]);
    mockWorkingHourRepository.findByBarber.mockResolvedValue([]);
    mockBlockedTimeRepository.findBySalon.mockResolvedValue([]);
    mockBlockedTimeRepository.findByBarber.mockResolvedValue([]);
    mockPrisma.booking.findMany.mockResolvedValue([]);
  });

  it("enumerates back-to-back slots covering the working window", async () => {
    const slots = await getAvailableSlots({
      salonId: "salon-1",
      barberId: "barber-1",
      serviceId: "svc-1",
      date: MONDAY,
    });

    expect(slots.map((s) => s.startAt)).toEqual([
      new Date("2026-08-17T09:00:00+05:00").toISOString(),
      new Date("2026-08-17T10:00:00+05:00").toISOString(),
      new Date("2026-08-17T11:00:00+05:00").toISOString(),
    ]);
  });

  it("excludes slots that overlap an existing active booking", async () => {
    mockPrisma.booking.findMany.mockResolvedValue([
      { startAt: new Date("2026-08-17T10:00:00+05:00"), endAt: new Date("2026-08-17T11:00:00+05:00") },
    ]);

    const slots = await getAvailableSlots({
      salonId: "salon-1",
      barberId: "barber-1",
      serviceId: "svc-1",
      date: MONDAY,
    });

    expect(slots.map((s) => s.startAt)).toEqual([
      new Date("2026-08-17T09:00:00+05:00").toISOString(),
      new Date("2026-08-17T11:00:00+05:00").toISOString(),
    ]);
  });

  it("returns nothing when the salon is closed that day", async () => {
    mockWorkingHourRepository.findBySalon.mockResolvedValue([
      { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
    ]);

    const slots = await getAvailableSlots({
      salonId: "salon-1",
      barberId: "barber-1",
      serviceId: "svc-1",
      date: MONDAY,
    });

    expect(slots).toEqual([]);
  });

  it("throws when the service does not belong to the salon", async () => {
    mockPrisma.service.findFirst.mockResolvedValue(null);

    await expect(
      getAvailableSlots({ salonId: "salon-1", barberId: "barber-1", serviceId: "missing", date: MONDAY }),
    ).rejects.toThrow("Service not found");
  });
});
