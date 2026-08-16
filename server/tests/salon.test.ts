import { beforeEach, describe, expect, it, vi } from "vitest";
import { boundingBox, haversineDistanceKm } from "../src/utils/geo";

const mockSalonRepository = vi.hoisted(() => ({
  findInBoundingBox: vi.fn(),
}));

vi.mock("../src/config/prisma", () => ({ prisma: {} }));
vi.mock("../src/repositories/salon.repository", () => ({
  salonRepository: mockSalonRepository,
}));
vi.mock("../src/services/settings.service", () => ({
  getSettings: vi.fn().mockResolvedValue({ defaultSearchRadius: 10 }),
}));

import { findNearbySalons } from "../src/services/salon.service";

describe("geo helpers", () => {
  it("returns 0 km for the same point", () => {
    expect(haversineDistanceKm(41.3111, 69.2797, 41.3111, 69.2797)).toBe(0);
  });

  it("computes a positive distance between nearby points", () => {
    const km = haversineDistanceKm(41.3111, 69.2797, 41.32, 69.29);
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(2);
  });

  it("builds a bounding box around the search radius", () => {
    const box = boundingBox(41.3111, 69.2797, 5);
    expect(box.minLat).toBeLessThan(41.3111);
    expect(box.maxLat).toBeGreaterThan(41.3111);
    expect(box.minLng).toBeLessThan(69.2797);
    expect(box.maxLng).toBeGreaterThan(69.2797);
  });
});

describe("SalonService.findNearbySalons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns salons inside the radius sorted by distance", async () => {
    mockSalonRepository.findInBoundingBox.mockResolvedValue([
      { id: "far", name: "Far Cut", lat: 41.5, lng: 69.5 },
      { id: "near", name: "Near Cut", lat: 41.312, lng: 69.281 },
      { id: "mid", name: "Mid Cut", lat: 41.33, lng: 69.3 },
    ]);

    const results = await findNearbySalons(41.3111, 69.2797, 5);

    expect(results.map((s) => s.id)).toEqual(["near", "mid"]);
    expect(results[0]?.distanceKm).toBeLessThan(results[1]?.distanceKm ?? Number.POSITIVE_INFINITY);
    expect(results.every((s) => s.distanceKm <= 5)).toBe(true);
    expect(mockSalonRepository.findInBoundingBox).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      "ACTIVE",
      undefined,
    );
  });

  it("returns an empty list when no salon is within radius", async () => {
    mockSalonRepository.findInBoundingBox.mockResolvedValue([
      { id: "far", name: "Far Cut", lat: 41.5, lng: 69.5 },
    ]);

    const results = await findNearbySalons(41.3111, 69.2797, 3);

    expect(results).toEqual([]);
  });
});
