import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  adminSetting: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const mockCache = vi.hoisted(() => ({
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
  cacheDel: vi.fn(),
  CACHE_KEYS: { settings: "cache:admin-settings" },
  CACHE_TTL: { settings: 300, salonPublic: 45 },
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/utils/cache", () => mockCache);

import { getSettings, updateSettings } from "../src/services/settings.service";

describe("settings cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached settings without hitting the database", async () => {
    mockCache.cacheGet.mockResolvedValue({
      id: "set-1",
      noShowLimit: 3,
      barberDelayCompensationPercent: 10,
      updatedAt: "2026-08-16T00:00:00.000Z",
    });

    const settings = await getSettings();
    expect(settings.id).toBe("set-1");
    expect(settings.barberDelayCompensationPercent).toBe(10);
    expect(mockPrisma.adminSetting.findFirst).not.toHaveBeenCalled();
  });

  it("loads from the database and writes cache on miss", async () => {
    mockCache.cacheGet.mockResolvedValue(null);
    mockPrisma.adminSetting.findFirst.mockResolvedValue({
      id: "set-1",
      noShowLimit: 3,
      barberDelayCompensationPercent: 10,
      updatedAt: new Date("2026-08-16T00:00:00.000Z"),
    });

    await getSettings();
    expect(mockCache.cacheSet).toHaveBeenCalled();
  });

  it("invalidates cache on PATCH", async () => {
    mockCache.cacheGet.mockResolvedValue({
      id: "set-1",
      noShowLimit: 3,
      barberDelayCompensationPercent: 10,
      updatedAt: new Date(),
    });
    mockPrisma.adminSetting.update.mockResolvedValue({
      id: "set-1",
      noShowLimit: 5,
      barberDelayCompensationPercent: 10,
      updatedAt: new Date(),
    });

    const updated = await updateSettings({ noShowLimit: 5 });
    expect(updated.noShowLimit).toBe(5);
    expect(mockCache.cacheDel).toHaveBeenCalledWith("cache:admin-settings");
  });
});
