import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn(),
  servicePriceHistory: { update: vi.fn(), create: vi.fn() },
  service: { update: vi.fn() },
}));

const mockServiceRepository = vi.hoisted(() => ({
  findById: vi.fn(),
}));

const mockPriceHistoryRepository = vi.hoisted(() => ({
  findOpenRecord: vi.fn(),
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/repositories/service.repository", () => ({
  serviceRepository: mockServiceRepository,
}));
vi.mock("../src/repositories/price-history.repository", () => ({
  priceHistoryRepository: mockPriceHistoryRepository,
}));
vi.mock("../src/services/audit.service", () => ({
  writeAudit: vi.fn().mockResolvedValue({}),
}));

import { changeServicePrice } from "../src/services/catalog.service";
import { writeAudit } from "../src/services/audit.service";

describe("CatalogService.changeServicePrice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceRepository.findById
      .mockResolvedValueOnce({
        id: "service-1",
        salonId: "salon-1",
        price: new Decimal(80_000),
      })
      .mockResolvedValueOnce({
        id: "service-1",
        salonId: "salon-1",
        price: new Decimal(100_000),
      });
    mockPriceHistoryRepository.findOpenRecord.mockResolvedValue({
      id: "history-1",
      price: new Decimal(80_000),
    });
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<void>) => {
      await fn(mockPrisma);
    });
  });

  it("closes open history, creates new record, updates service price, and audits", async () => {
    await changeServicePrice("service-1", 100_000, "owner-1");

    expect(mockPrisma.servicePriceHistory.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "history-1" },
        data: { effectiveTo: expect.any(Date) },
      }),
    );
    expect(mockPrisma.servicePriceHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          serviceId: "service-1",
          price: new Decimal(100_000),
          effectiveFrom: expect.any(Date),
        }),
      }),
    );
    expect(mockPrisma.service.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "service-1" },
        data: { price: new Decimal(100_000) },
      }),
    );
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "PRICE_CHANGED",
        entityId: "service-1",
        metadata: expect.objectContaining({
          previousPrice: 80_000,
          newPrice: 100_000,
        }),
      }),
    );
  });
});
