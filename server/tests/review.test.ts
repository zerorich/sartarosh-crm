import { describe, expect, it, vi, beforeEach } from "vitest";
import { AppError } from "../src/utils/app-error";
import { ERROR_CODES } from "../src/types";

const mockPrisma = vi.hoisted(() => ({
  booking: {
    findUnique: vi.fn(),
  },
  review: {
    create: vi.fn(),
    aggregate: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  barberProfile: { update: vi.fn() },
  salon: { update: vi.fn() },
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/services/audit.service", () => ({ writeAudit: vi.fn() }));
vi.mock("../src/services/settings.service", () => ({
  getSettings: vi.fn().mockResolvedValue({ reviewEditWindow: 48 }),
}));

import { createReview, updateReview } from "../src/services/review.service";

describe("Review validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { barberRating: 4, salonRating: 4 }, _count: 1 });
    mockPrisma.barberProfile.update.mockResolvedValue({});
    mockPrisma.salon.update.mockResolvedValue({});
  });

  it("rejects review when booking is not completed", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "b1",
      clientId: "c1",
      status: "CONFIRMED",
      salonId: "s1",
      barberId: "bar1",
      serviceId: "svc1",
      review: null,
    });

    await expect(
      createReview({
        clientId: "c1",
        bookingId: "b1",
        barberRating: 5,
        salonRating: 5,
        serviceRating: 5,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ERROR_CODES.REVIEW_NOT_ALLOWED,
    });
  });

  it("rejects duplicate review", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "b1",
      clientId: "c1",
      status: "COMPLETED",
      salonId: "s1",
      barberId: "bar1",
      serviceId: "svc1",
      review: { id: "r1" },
    });

    await expect(
      createReview({
        clientId: "c1",
        bookingId: "b1",
        barberRating: 5,
        salonRating: 5,
        serviceRating: 5,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: ERROR_CODES.REVIEW_EXISTS,
    });
  });

  it("rejects review from non-owner client", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "b1",
      clientId: "other-client",
      status: "COMPLETED",
      salonId: "s1",
      barberId: "bar1",
      serviceId: "svc1",
      review: null,
    });

    await expect(
      createReview({
        clientId: "c1",
        bookingId: "b1",
        barberRating: 5,
        salonRating: 5,
        serviceRating: 5,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("creates review for completed booking", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "b1",
      clientId: "c1",
      status: "COMPLETED",
      salonId: "s1",
      barberId: "bar1",
      serviceId: "svc1",
      review: null,
    });
    mockPrisma.review.create.mockResolvedValue({ id: "r1", bookingId: "b1" });

    const review = await createReview({
      clientId: "c1",
      bookingId: "b1",
      barberRating: 5,
      salonRating: 4,
      serviceRating: 5,
      comment: "Excellent",
    });

    expect(review.id).toBe("r1");
    expect(mockPrisma.review.create).toHaveBeenCalledOnce();
  });

  it("rejects edit outside review window", async () => {
    const oldDate = new Date();
    oldDate.setHours(oldDate.getHours() - 100);

    mockPrisma.review.findUnique.mockResolvedValue({
      id: "r1",
      clientId: "c1",
      barberId: "bar1",
      salonId: "s1",
      isHidden: false,
      createdAt: oldDate,
    });

    await expect(
      updateReview({ reviewId: "r1", clientId: "c1", barberRating: 3 }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ERROR_CODES.REVIEW_NOT_ALLOWED,
    });
  });
});
